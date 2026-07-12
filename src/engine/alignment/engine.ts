import type { AlignmentResult } from '../../types/alignment'
import { slidingAlignment } from './sliding'
import { localAlignment } from './local'
import { snapgeneAlignment } from './snapgene'
import { reverseComplement } from '../sequence/reverseComplement'
import { calculateQualityScore } from './scoring'
import { methodWeight } from './methodWeight'
import { detectConflict } from './conflict'
import { getConfidence } from './confidence'
import { selectMethods } from './alignmentManager'
import { removeDuplicateResults } from './deduplicate'
import { recommendBest } from './recommend'
import { methodPriority } from './priority'
import { MIN_QUERY_LENGTH } from '../config'
import type { AlignmentConfig } from './alignmentManager'

// 支持的算法白名单
const AVAILABLE_METHODS = [
  'Sliding',
  'Local',
  'Reverse Complement',
  'SnapGene',
]

/** 比较两个结果，返回综合质量分更高的 */
function chooseBest(a: AlignmentResult | null, b: AlignmentResult | null): AlignmentResult | null {
  if (!a) return b
  if (!b) return a
  return (a.qualityScore ?? a.identity) >= (b.qualityScore ?? b.identity) ? a : b
}

/**
 * Sliding / Local 方向检查
 *
 * 同时执行正向和反向互补比对，取更优结果
 * （SnapGene 自身已处理方向判断）
 */
function runWithOrientation(
  reference: string,
  query: string,
  method: 'Sliding' | 'Local',
): AlignmentResult | null {
  const rcQuery = reverseComplement(query)

  let forward: AlignmentResult | null = null
  let reverse: AlignmentResult | null = null

  if (method === 'Sliding') {
    forward = slidingAlignment(reference, query, 'Sliding')
    reverse = slidingAlignment(reference, rcQuery, 'Sliding')
  } else {
    forward = localAlignment(reference, query)
    reverse = localAlignment(reference, rcQuery)
  }

  if (reverse) {
    reverse.orientation = 'Reverse Complement'
  }

  // 临时计算 qualityScore 用于比较
  if (forward) forward.qualityScore = forward.identity
  if (reverse) reverse.qualityScore = reverse.identity

  return chooseBest(forward, reverse)
}

/** 单算法执行 */
function runSingle(
  reference: string,
  query: string,
  method: string,
): AlignmentResult | null {
  switch (method) {
    case 'Sliding':
      return runWithOrientation(reference, query, 'Sliding')
    case 'Local':
      return runWithOrientation(reference, query, 'Local')
    case 'Reverse Complement': {
      const rc = reverseComplement(query)
      return slidingAlignment(reference, rc, 'Reverse Complement')
    }
    case 'SnapGene':
      return snapgeneAlignment(reference, query)
    default:
      return null
  }
}

/**
 * 统一比对入口
 *
 * 流程：
 * 1. selectMethods — 智能选择算法
 * 2. 执行各算法
 * 3. 计算 qualityScore（基础分 × 权重）
 * 4. removeDuplicateResults — 去重
 * 5. detectConflict — 冲突检测
 * 6. getConfidence — 可信度评级
 * 7. 按 qualityScore + 优先级排序
 */
export function runAlignment(
  reference: string,
  query: string,
  methodsOrConfig: string[] | AlignmentConfig,
): AlignmentResult[] {
  if (!reference || !reference.trim()) {
    throw new Error('Reference 序列不能为空')
  }

  if (!query || !query.trim()) {
    throw new Error('Query 序列不能为空')
  }

  reference = reference.trim().toUpperCase()
  query = query.trim().toUpperCase()

  // Step 4.10：短序列警告（不禁止，部分实验序列可能较短）
  if (query.length < MIN_QUERY_LENGTH) {
    console.warn(`[Alignment] Query 长度过短（${query.length}bp），可能产生随机命中`)
  }

  const config: AlignmentConfig = Array.isArray(methodsOrConfig)
    ? { autoSelect: false, methods: methodsOrConfig }
    : methodsOrConfig

  const selectedMethods = selectMethods(reference, query, config)
  const validMethods = selectedMethods.filter((m) => AVAILABLE_METHODS.includes(m))

  const results: AlignmentResult[] = []
  for (const method of validMethods) {
    try {
      const result = runSingle(reference, query, method)
      if (result) {
        results.push(result)
      }
    } catch (error) {
      console.warn(`[Alignment] ${method} 算法失败`, error)
      continue
    }
  }

  // 计算统一质量评分（基础分 × 算法权重）
  results.forEach((r) => {
    const baseScore = calculateQualityScore(r)
    const weight = methodWeight[r.method] ?? 1
    r.qualityScore = Number((baseScore * weight).toFixed(2))
  })

  // 结果去重
  const deduped = removeDuplicateResults(results, methodPriority)

  // 冲突检测（基于去重后结果）
  const hasConflict = detectConflict(deduped)

  // 可信度评级 + 冲突标记
  deduped.forEach((r) => {
    r.confidence = getConfidence(r.qualityScore ?? 0)
    r.conflict = hasConflict
  })

  if (deduped.length === 0) {
    console.warn('[Alignment] 所有算法均未产生结果', {
      referenceLength: reference.length,
      queryLength: query.length,
    })
  }

  return deduped.sort((a, b) => {
    const scoreDiff = (b.qualityScore ?? 0) - (a.qualityScore ?? 0)
    if (scoreDiff !== 0) return scoreDiff
    return (methodPriority[b.method] ?? 0) - (methodPriority[a.method] ?? 0)
  })
}

/** 快捷获取最佳结果 */
export function runBestAlignment(
  reference: string,
  query: string,
  config: AlignmentConfig = {},
): AlignmentResult | null {
  const results = runAlignment(reference, query, config)
  return recommendBest(results)
}
