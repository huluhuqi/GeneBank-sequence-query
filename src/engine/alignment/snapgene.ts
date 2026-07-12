import type { AlignmentResult } from '../../types/alignment'
import { kmerSimilarity } from './preFilter'
import { getCache, setCache } from './cache'
import { reverseComplement } from '../sequence/reverseComplement'
import { calculateCoordinates } from './coordinate'
import { calculateIdentity } from './statistics'
import {
  extendCircularReference,
  normalizeCircularPosition,
  shouldTryCircular,
} from './circular'

/** DP 矩阵最大单元格数，超过则跳过 DP（10M ≈ 3162bp × 3162bp）
 *
 * 短序列定位是核心需求（siRNA/primer/oligo）：
 * - 21nt Query × 100kb Reference = 2.1M cells（安全）
 * - 21nt Query × 500kb Reference = 10.5M cells（超限，跳过）
 */
const MAX_DP_CELLS = 10_000_000

/** k-mer 相似度阈值，低于此值视为无关序列，跳过 DP */
const MIN_SIMILARITY = 0.05

/** 长 Query 长度比例阈值（仅对 Query ≥ 500bp 生效）
 *
 * 短 Query（< 50bp）：siRNA/primer/oligo 定位场景，不限制比例
 * 中等 Query（50-499bp）：正常 DP
 * 长 Query（≥ 500bp）：启用比例保护，避免无意义 DP
 */
const MIN_LENGTH_RATIO_LONG_QUERY = 0.01

/** 短序列阈值（≤50bp 视为短序列定位模式） */
const SHORT_QUERY_THRESHOLD = 50

/** 长 Query 阈值（≥500bp 启用长度比例保护） */
const LONG_QUERY_THRESHOLD = 500

/** 生成零分结果（预筛选跳过 / 长序列保护 / 长度差异） */
function zeroResult(reference: string, query: string): AlignmentResult {
  return {
    id: crypto.randomUUID(),
    referenceName: '',
    queryName: '',
    referenceSequence: reference,
    querySequence: query,
    method: 'SnapGene',
    identity: 0,
    score: 0,
    match: 0,
    mismatch: 0,
    gap: 0,
    referenceStart: 0,
    referenceEnd: 0,
    queryStart: 0,
    queryEnd: 0,
    alignedReference: '',
    alignedQuery: '',
    similarity: 0,
    orientation: 'Forward',
  }
}

/** 评分参数（默认值，中等长度序列）
 *
 * 短序列会在 getScoringParams 中被覆盖为更严格的参数
 */
const MATCH = 2
const MISMATCH = -1
const GAP = -1

/** 短序列评分参数（Query ≤ 50bp）
 *
 * 短序列（siRNA/primer/oligo）场景：
 * - 精确匹配最重要：match=3（提高匹配奖励）
 * - 错配严重：mismatch=-2（加重错配惩罚）
 * - 避免 gap：gap=-1（轻微惩罚，不强烈回避）
 *
 * 这样 21nt 完全匹配 = 63 分，远高于含 gap 的结果
 */
const SHORT_MATCH = 3
const SHORT_MISMATCH = -2
const SHORT_GAP = -1

/** 根据 Query 长度返回评分参数 */
function getScoringParams(queryLength: number): {
  match: number
  mismatch: number
  gap: number
} {
  if (queryLength <= SHORT_QUERY_THRESHOLD) {
    return { match: SHORT_MATCH, mismatch: SHORT_MISMATCH, gap: SHORT_GAP }
  }
  return { match: MATCH, mismatch: MISMATCH, gap: GAP }
}

/** 综合评分：用于正向/反向互补结果比较 */
function alignmentScore(result: {
  identity: number
  similarity?: number
  score: number
}): number {
  return (
    result.identity * 0.7
    + (result.similarity ?? 0) * 0.2
    + (Math.max(0, result.score) / 100) * 10
  )
}

/** 核心 DP 比对（不含预筛选 / 缓存 / 方向判断）
 *
 * 采用半全局比对（semi-global alignment）：
 * - Reference 端可以自由移位（第 0 行初始化为 0）
 * - Query 必须完全对齐（第 0 列初始化为 gap penalty）
 * - 回溯起点：最后一行中得分最高的位置
 * - 适合场景：短 Query 在长 Reference 中定位（引物、探针、小片段验证）
 */
function snapgeneCore(
  reference: string,
  query: string,
): Omit<AlignmentResult, 'id' | 'referenceName' | 'queryName' | 'referenceSequence' | 'querySequence' | 'method' | 'referenceId' | 'queryId'> {
  const ref = reference.toUpperCase()
  const qry = query.toUpperCase()

  const m = ref.length
  const n = qry.length

  // 根据 Query 长度动态选择评分参数
  const { match: MATCH_P, mismatch: MISMATCH_P, gap: GAP_P } = getScoringParams(n)
  const isShortMode = n <= SHORT_QUERY_THRESHOLD

  console.log('[SnapGene] input', {
    referenceLength: m,
    queryLength: n,
    reference: ref.slice(0, 100),
    query: qry.slice(0, 100),
    mode: isShortMode ? 'short' : 'normal',
    scoring: { match: MATCH_P, mismatch: MISMATCH_P, gap: GAP_P },
  })

  // =========================
  // DP 矩阵
  // =========================
  console.log('[SnapGene] DP size', {
    rows: m + 1,
    cols: n + 1,
    cells: (m + 1) * (n + 1),
  })

  const dp: number[][] = Array.from(
    { length: m + 1 },
    () => new Array<number>(n + 1).fill(0),
  )

  // 半全局模式：
  // - 第 0 行：Reference 端自由移位，全部为 0
  // - 第 0 列：Query 端必须对齐，施加 gap penalty
  for (let i = 1; i <= m; i++) {
    dp[i][0] = 0
  }
  for (let j = 1; j <= n; j++) {
    dp[0][j] = j * GAP_P
  }

  // =========================
  // 动态规划
  // =========================
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const matchScore = ref[i - 1] === qry[j - 1] ? MATCH_P : MISMATCH_P

      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + matchScore,
        dp[i - 1][j] + GAP_P,
        dp[i][j - 1] + GAP_P,
      )
    }
  }

  // =========================
  // 回溯：从最后一行最高分位置开始
  // =========================
  let maxScore = -Infinity
  let bestI = m
  for (let i = 1; i <= m; i++) {
    if (dp[i][n] > maxScore) {
      maxScore = dp[i][n]
      bestI = i
    }
  }

  console.log('[SnapGene] traceback start', {
    bestI,
    j: n,
    maxScore,
  })

  let i = bestI
  let j = n

  let alignedReference = ''
  let alignedQuery = ''

  while (j > 0) {
    if (i > 0 && j > 0) {
      const score = ref[i - 1] === qry[j - 1] ? MATCH_P : MISMATCH_P

      if (dp[i][j] === dp[i - 1][j - 1] + score) {
        alignedReference = ref[i - 1] + alignedReference
        alignedQuery = qry[j - 1] + alignedQuery
        i--
        j--
        continue
      }
    }

    if (i > 0 && dp[i][j] === dp[i - 1][j] + GAP_P) {
      alignedReference = ref[i - 1] + alignedReference
      alignedQuery = '-' + alignedQuery
      i--
    } else if (j > 0) {
      alignedReference = '-' + alignedReference
      alignedQuery = qry[j - 1] + alignedQuery
      j--
    }
  }

  // =========================
  // 统计结果
  // =========================
  let match = 0
  let mismatch = 0
  let gap = 0

  for (let k = 0; k < alignedReference.length; k++) {
    const a = alignedReference[k]
    const b = alignedQuery[k]

    if (a === '-' || b === '-') {
      gap++
    } else if (a === b) {
      match++
    } else {
      mismatch++
    }
  }

  // identity：match / (match + mismatch + gap) × 100（gap 纳入分母）
  const identity = calculateIdentity(match, mismatch, gap)

  // similarity：错配算 0.5 权重，gap 不计入
  const similarity = match + mismatch > 0
    ? Number((((match + mismatch * 0.5) / (match + mismatch)) * 100).toFixed(2))
    : 0

  console.log('[SnapGene] final', {
    match,
    mismatch,
    gap,
    identity,
    referenceStart: i,
    referenceEnd: bestI,
    queryStart: 0,
    queryEnd: n,
    alignedReference: alignedReference.length > 80 ? alignedReference.slice(0, 80) + '...' : alignedReference,
    alignedQuery: alignedQuery.length > 80 ? alignedQuery.slice(0, 80) + '...' : alignedQuery,
    lengthRef: alignedReference.length,
    lengthQuery: alignedQuery.length,
    maxScore,
    tracebackStartI: bestI,
    tracebackEndI: i,
  })

  console.log('[SnapGene alignment]', {
    alignedReference: alignedReference.length > 200 ? alignedReference.slice(0, 200) + '...' : alignedReference,
    alignedQuery: alignedQuery.length > 200 ? alignedQuery.slice(0, 200) + '...' : alignedQuery,
    lengthRef: alignedReference.length,
    lengthQuery: alignedQuery.length,
    score: maxScore,
    match,
    mismatch,
    gap,
    identity,
  })

  // 空结果保护
  if (
    !alignedReference ||
    !alignedQuery ||
    alignedReference.length === 0 ||
    alignedQuery.length === 0
  ) {
    return {
      identity: 0,
      match: 0,
      mismatch: 0,
      gap: 0,
      score: 0,
      referenceStart: 0,
      referenceEnd: 0,
      queryStart: 0,
      queryEnd: 0,
      alignedReference: '',
      alignedQuery: '',
      similarity: 0,
    }
  }

  // 计算真实坐标（基于 alignment 字符串，1-based）
  const coords = calculateCoordinates(alignedReference, alignedQuery)

  console.log('[SnapGene coordinate]', {
    start: coords.referenceStart,
    end: coords.referenceEnd,
    length: coords.referenceEnd - coords.referenceStart + 1,
    queryStart: coords.queryStart,
    queryEnd: coords.queryEnd,
    match,
    mismatch,
    gap,
    identity,
    dpTracebackStartI: bestI,
    dpTracebackEndI: i,
    note: 'coords 为 1-based，gap 不计入坐标',
  })

  return {
    alignedReference,
    alignedQuery,
    score: maxScore,
    identity,
    match,
    mismatch,
    gap,
    similarity,
    ...coords,
  }
}

/**
 * SnapGene 风格全局序列比对
 *
 * 基于 Needleman-Wunsch 动态规划算法
 * 适合短序列比对：引物、siRNA、ASO、小片段验证
 *
 * 优化措施：
 * 1. k-mer 预筛选 — 仅长序列（≥100bp），短序列直接进入 DP
 * 2. 结果缓存 — 相同 (ref, query) 对不重复计算
 * 3. 长序列保护 — 超过阈值跳过 DP
 * 4. 长度比例保护 — 长度差异过大返回低分
 * 5. 方向检测 — 自动比较正向 / 反向互补，基于综合评分取更优
 *
 * 复杂度 O(M×N)，不建议用于全基因组级比对
 */
export function snapgeneAlignment(
  reference: string,
  query: string,
): AlignmentResult | null {
  // Step 4.9：输入保护
  if (!reference || !query || query.length === 0) {
    return null
  }

  // =========================
  // 缓存检查
  // =========================
  const cacheKey = `${reference}__${query}`
  const cached = getCache(cacheKey)
  if (cached) {
    return { ...cached, id: crypto.randomUUID() }
  }

  // =========================
  // 长序列保护（DP 矩阵大小限制）
  // =========================
  if (reference.length * query.length > MAX_DP_CELLS) {
    console.warn('[SnapGene] 跳过: 长序列保护', { refLen: reference.length, qryLen: query.length, cells: reference.length * query.length, max: MAX_DP_CELLS })
    return zeroResult(reference, query)
  }

  // =========================
  // 长度比例保护（仅对长 Query 生效）
  //
  // 短 Query（< 50bp）：siRNA/primer/oligo 定位场景，不限制比例
  // 中等 Query（50-499bp）：正常 DP
  // 长 Query（≥ 500bp）：启用比例保护，避免无意义 DP
  // =========================
  if (query.length >= LONG_QUERY_THRESHOLD) {
    const ratio = query.length / reference.length
    if (ratio < MIN_LENGTH_RATIO_LONG_QUERY) {
      console.warn('[SnapGene] 跳过: 长 Query 比例过小', {
        refLen: reference.length,
        qryLen: query.length,
        ratio,
        min: MIN_LENGTH_RATIO_LONG_QUERY,
      })
      return zeroResult(reference, query)
    }
  } else if (query.length <= SHORT_QUERY_THRESHOLD) {
    console.log('[SnapGene] short sequence mode', {
      referenceLength: reference.length,
      queryLength: query.length,
    })
  }

  // =========================
  // k-mer 预筛选（仅长 Query，短序列必须进入 DP）
  // =========================
  if (query.length >= 100) {
    const kmerSim = kmerSimilarity(reference.toUpperCase(), query.toUpperCase())
    if (kmerSim < MIN_SIMILARITY) {
      console.warn('[SnapGene] 跳过: k-mer 相似度过低', { kmerSim, min: MIN_SIMILARITY })
      return zeroResult(reference, query)
    }
  }

  // =========================
  // 正向比对
  // =========================
  const normal = snapgeneCore(reference, query)

  // =========================
  // 反向互补比对
  // =========================
  const rcQuery = reverseComplement(query)
  const rc = snapgeneCore(reference, rcQuery)

  // =========================
  // 方向判断：基于综合评分取更优
  // =========================
  const isRC = alignmentScore(rc) > alignmentScore(normal)
  const best = isRC ? rc : normal

  // 显式标注 orientation 类型，避免推断为 string
  const orientation: 'Forward' | 'Reverse Complement' = isRC
    ? 'Reverse Complement'
    : 'Forward'
  let bestResult = {
    ...best,
    orientation,
    circular: false,
    crossOrigin: false,
  }

  // =========================
  // 环状模式（质粒 DNA 跨 origin 比对）
  //
  // 对短 Query（≤500bp）尝试环状模式：
  // - 扩展 reference 末尾追加 query 长度的头部
  // - 运行一次 DP（而非遍历所有起点）
  // - 如果命中在扩展区域且得分更高，使用环状结果
  // =========================
  if (shouldTryCircular(query.length)) {
    const { extendedReference, originalLength } = extendCircularReference(
      reference,
      query.length,
    )

    // 环状正向比对
    const circularNormal = snapgeneCore(extendedReference, query)

    // 环状反向互补比对
    const circularRC = snapgeneCore(extendedReference, rcQuery)

    // 选择环状模式中更好的方向
    const isCircularRC =
      alignmentScore(circularRC) > alignmentScore(circularNormal)
    const circularBest = isCircularRC ? circularRC : circularNormal

    // 比较环状模式和线性模式
    if (alignmentScore(circularBest) > alignmentScore(best)) {
      // 环状模式更好，检查是否跨越 origin
      const refEnd = circularBest.referenceEnd ?? 0
      const refStart = circularBest.referenceStart ?? 0

      const { start, end, crossOrigin } = normalizeCircularPosition(
        refStart,
        refEnd,
        originalLength,
      )

      const circularOrientation: 'Forward' | 'Reverse Complement' =
        isCircularRC ? 'Reverse Complement' : 'Forward'

      bestResult = {
        ...circularBest,
        orientation: circularOrientation,
        referenceStart: start,
        referenceEnd: end,
        circular: true,
        crossOrigin,
      }

      console.log('[SnapGene] circular mode hit', {
        originalLength,
        extendedRefStart: refStart,
        extendedRefEnd: refEnd,
        normalizedStart: start,
        normalizedEnd: end,
        crossOrigin,
        orientation: bestResult.orientation,
      })
    }
  }

  const result: AlignmentResult = {
    id: crypto.randomUUID(),
    referenceName: '',
    queryName: '',
    referenceSequence: reference,
    querySequence: query,
    method: 'SnapGene',
    ...bestResult,
  }

  // =========================
  // Reverse Complement 坐标方向修正
  //
  // SnapGene 显示逻辑：RC 方向时 Reference 位置显示为 end → start
  // 例如：RC 16743 → 16723（从大到小，表示反向读取）
  // =========================
  if (result.orientation === 'Reverse Complement') {
    const temp = result.referenceStart
    result.referenceStart = result.referenceEnd
    result.referenceEnd = temp
  }

  // =========================
  // 写入缓存
  // =========================
  setCache(cacheKey, result)

  return result
}
