import type { AlignmentResult } from '../../types/alignment'
import { calculateCoverage } from './statistics'
import { methodWeight } from './methodWeight'

/**
 * 短序列奖励
 *
 * SnapGene 对 primer/oligo/short DNA fragment 不会因为短而降低可信度
 * - < 30bp（siRNA/sgRNA）：+10
 * - < 50bp（primer）：+5
 * - 其他：0
 */
function shortSequenceBonus(queryLength: number): number {
  if (queryLength < 30) return 10
  if (queryLength < 50) return 5
  return 0
}

/**
 * 低复杂度惩罚
 *
 * 防止 AAAAAAAAAAAA / TTTTTTTTTT 这种低复杂度序列假命中
 * - 统计每种碱基出现次数
 * - 若单一碱基占比 > 70%，惩罚 -15 分
 */
function complexityPenalty(sequence: string | undefined): number {
  if (!sequence || sequence.length === 0) return 0

  const counts: Record<string, number> = {}
  for (const c of sequence) {
    counts[c] = (counts[c] ?? 0) + 1
  }

  const max = Math.max(...Object.values(counts))
  const ratio = max / sequence.length

  if (ratio > 0.7) {
    return -15
  }

  return 0
}

/**
 * BLAST-like 统一评分计算
 *
 * 公式：
 *   rawScore      = match × 2 - mismatch × 3 - gap × 4   （BLAST-like bit score）
 *   identityScore = identity × 0.7                        （identity 权重 70%）
 *   coverageScore = coverage × 0.3                       （coverage 权重 30%）
 *   finalScore    = (rawScore + identityScore + coverageScore) × methodWeight
 *                   + shortSequenceBonus
 *                   + complexityPenalty
 *                   + circularBonus（环状跨 origin 命中 +8）
 *
 * - rawScore：BLAST 风格的原始得分，match 加分多，gap 惩罚最重
 * - identity 贡献 70%（匹配区域内的替换率）
 * - coverage 贡献 30%（Query 覆盖率）
 * - 算法权重：SnapGene > Local ≈ RC > Sliding
 * - 短序列奖励：避免短序列因天然低 coverage 被低估
 * - 低复杂度惩罚：防止 poly-A / poly-T 假命中
 * - 环状奖励：质粒跨 origin 的 primer/feature 定位应优先
 *
 * 不限制 0-100 范围（BLAST bit score 可超过 100）
 */
export function calculateQualityScore(result: AlignmentResult): number {
  const qryLen = result.querySequence?.length ?? 0

  // 计算 coverage（Query 覆盖率）
  const coverage = calculateCoverage(qryLen, result.match, result.mismatch)

  // 1. BLAST-like rawScore
  const rawScore = result.match * 2 - result.mismatch * 3 - result.gap * 4

  // 2. identity 权重 70%
  const identityScore = result.identity * 0.7

  // 3. coverage 权重 30%
  const coverageScore = coverage * 0.3

  // 4. 基础分（rawScore + identity + coverage）
  let finalScore = rawScore + identityScore + coverageScore

  // 5. 算法权重
  const weight = methodWeight[result.method] ?? 1
  finalScore *= weight

  // 6. 短序列奖励
  finalScore += shortSequenceBonus(qryLen)

  // 7. 低复杂度惩罚
  finalScore += complexityPenalty(result.querySequence)

  // 8. 环状序列跨 origin 奖励
  // 质粒 DNA 跨 origin 的 primer/feature 定位在生物学上意义更大，应优先于普通线性命中
  if (result.circular) {
    finalScore += 8
  }

  return Number(finalScore.toFixed(2))
}

/**
 * 多级排序比较函数
 *
 * 排序优先级：
 * 1. qualityScore（finalScore）高的优先
 * 2. identity 高的优先
 * 3. gap 少的优先
 * 4. match 多的优先
 *
 * 返回值：负数表示 a 排前，正数表示 b 排前
 */
export function compareAlignmentResults(
  a: AlignmentResult,
  b: AlignmentResult,
): number {
  // 第一优先级：qualityScore
  const scoreDiff = (b.qualityScore ?? 0) - (a.qualityScore ?? 0)
  if (scoreDiff !== 0) return scoreDiff

  // 第二优先级：identity
  const identityDiff = b.identity - a.identity
  if (identityDiff !== 0) return identityDiff

  // 第三优先级：gap（少的优先）
  const gapDiff = a.gap - b.gap
  if (gapDiff !== 0) return gapDiff

  // 第四优先级：match（多的优先）
  return b.match - a.match
}
