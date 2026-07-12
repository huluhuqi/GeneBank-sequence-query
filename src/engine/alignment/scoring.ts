import type { AlignmentResult } from '../../types/alignment'
import { calculateCoverage } from './statistics'
import { methodWeight } from './methodWeight'

/**
 * 统一质量评分计算
 *
 * 公式：Quality Score = Identity × 0.7 + Coverage × 0.25 - Mismatch × 2 - Gap × 0.5
 *       然后乘以算法权重
 *       短序列完全匹配额外 +20
 *
 * - identity 贡献 70%（核心指标：匹配区域内的替换率）
 * - coverage 贡献 25%（Query 覆盖率：有多少 Query 碱基参与比对）
 * - mismatch 惩罚 2 分/个（错配严重降低评分）
 * - gap 惩罚 0.5 分/个（gap 轻微惩罚）
 * - 算法权重：SnapGene > Local ≈ RC > Sliding
 * - 短序列（≤50bp）完全匹配（identity=100, coverage=100）+20 分
 *
 * 返回 0~100 的评分
 */
export function calculateQualityScore(result: AlignmentResult): number {
  const qryLen = result.querySequence?.length ?? 0

  // 计算 coverage（Query 覆盖率）
  const coverage = calculateCoverage(qryLen, result.match, result.mismatch)

  let score = 0

  // 1. identity 权重 70%
  score += result.identity * 0.7

  // 2. coverage 权重 25%
  score += coverage * 0.25

  // 3. mismatch 惩罚 2 分/个
  score -= result.mismatch * 2

  // 4. gap 惩罚 0.5 分/个
  score -= result.gap * 0.5

  // 5. 算法权重
  const weight = methodWeight[result.method] ?? 1
  score *= weight

  // 6. 短序列完全匹配奖励
  //
  // 短序列（siRNA/primer/oligo，≤50bp）完全匹配（identity=100, coverage=100）
  // 是强信号，应给予显著加分
  if (qryLen > 0 && qryLen <= 50 && result.identity === 100 && coverage === 100) {
    score += 20
  }

  return Number(Math.max(0, Math.min(100, score)).toFixed(2))
}
