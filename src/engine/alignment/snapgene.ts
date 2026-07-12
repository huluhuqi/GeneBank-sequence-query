import type { AlignmentResult } from '../../types/alignment'
import { kmerSimilarity } from './preFilter'
import { getCache, setCache } from './cache'
import { reverseComplement } from '../sequence/reverseComplement'
import { calculateCoordinates } from './coordinate'
import { calculateIdentity } from './statistics'

/** DP 矩阵最大单元格数，超过则跳过 DP（5M ≈ 2236bp × 2236bp） */
const MAX_DP_CELLS = 5_000_000

/** k-mer 相似度阈值，低于此值视为无关序列，跳过 DP */
const MIN_SIMILARITY = 0.05

/** 长度比例阈值，低于此值视为长度差异过大 */
const MIN_LENGTH_RATIO = 0.1

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

/** 评分参数 */
const MATCH = 3
const MISMATCH = -2
const GAP = -5

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

/** 核心 DP 比对（不含预筛选 / 缓存 / 方向判断） */
function snapgeneCore(
  reference: string,
  query: string,
  gapPenalty: number,
): Omit<AlignmentResult, 'id' | 'referenceName' | 'queryName' | 'referenceSequence' | 'querySequence' | 'method' | 'referenceId' | 'queryId'> {
  const ref = reference.toUpperCase()
  const qry = query.toUpperCase()

  const m = ref.length
  const n = qry.length

  // =========================
  // DP 矩阵
  // =========================
  const dp: number[][] = Array.from(
    { length: m + 1 },
    () => new Array<number>(n + 1).fill(0),
  )

  for (let i = 1; i <= m; i++) {
    dp[i][0] = i * gapPenalty
  }
  for (let j = 1; j <= n; j++) {
    dp[0][j] = j * gapPenalty
  }

  // =========================
  // 动态规划
  // =========================
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const matchScore = ref[i - 1] === qry[j - 1] ? MATCH : MISMATCH

      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + matchScore,
        dp[i - 1][j] + gapPenalty,
        dp[i][j - 1] + gapPenalty,
      )
    }
  }

  // =========================
  // 回溯生成 alignment
  // =========================
  let i = m
  let j = n

  let alignedReference = ''
  let alignedQuery = ''

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const score = ref[i - 1] === qry[j - 1] ? MATCH : MISMATCH

      if (dp[i][j] === dp[i - 1][j - 1] + score) {
        alignedReference = ref[i - 1] + alignedReference
        alignedQuery = qry[j - 1] + alignedQuery
        i--
        j--
        continue
      }
    }

    if (i > 0 && dp[i][j] === dp[i - 1][j] + gapPenalty) {
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

  // identity：统一公式 match / (match + mismatch + gap) × 100
  const identity = calculateIdentity(match, mismatch, gap)

  // similarity：错配算 0.5 权重，gap 不计入
  const similarity = match + mismatch > 0
    ? Number((((match + mismatch * 0.5) / (match + mismatch)) * 100).toFixed(2))
    : 0

  // 计算真实坐标（基于 alignment 字符串）
  const coords = calculateCoordinates(alignedReference, alignedQuery)

  return {
    alignedReference,
    alignedQuery,
    score: dp[m][n],
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
  // 长序列保护
  // =========================
  if (reference.length * query.length > MAX_DP_CELLS) {
    return zeroResult(reference, query)
  }

  // =========================
  // 长度比例保护
  // =========================
  const lengthRatio =
    Math.min(reference.length, query.length) /
    Math.max(reference.length, query.length)
  if (lengthRatio < MIN_LENGTH_RATIO) {
    return zeroResult(reference, query)
  }

  // =========================
  // k-mer 预筛选（仅长序列，短序列必须进入 DP）
  // =========================
  if (query.length >= 100) {
    const kmerSim = kmerSimilarity(reference.toUpperCase(), query.toUpperCase())
    if (kmerSim < MIN_SIMILARITY) {
      return zeroResult(reference, query)
    }
  }

  // =========================
  // 正向比对
  // =========================
  const normal = snapgeneCore(reference, query, GAP)

  // =========================
  // 反向互补比对
  // =========================
  const rcQuery = reverseComplement(query)
  const rc = snapgeneCore(reference, rcQuery, GAP)

  // =========================
  // 方向判断：基于综合评分取更优
  // =========================
  const isRC = alignmentScore(rc) > alignmentScore(normal)
  const best = isRC ? rc : normal

  const result: AlignmentResult = {
    id: crypto.randomUUID(),
    referenceName: '',
    queryName: '',
    referenceSequence: reference,
    querySequence: query,
    method: 'SnapGene',
    ...best,
    orientation: isRC ? 'Reverse Complement' : 'Forward',
  }

  // =========================
  // 写入缓存
  // =========================
  setCache(cacheKey, result)

  return result
}
