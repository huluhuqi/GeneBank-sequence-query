import type { AlignmentResult } from '../../types/alignment'

/**
 * 统一质量评分计算
 *
 * 公式：Quality Score = Identity × 60% + Coverage × 20% - Mismatch - Gap × 0.5
 *
 * - identity 贡献 60%（核心指标）
 * - 长度覆盖率贡献 20%（避免局部比对虚高）
 * - mismatch 惩罚 1 分/个
 * - gap 惩罚 0.5 分/个
 * - 短序列完全匹配加 20 分（短序列完全匹配是强信号）
 *
 * 返回 0~100 的评分
 */
export function calculateQualityScore(result: AlignmentResult): number {
  let score = 0

  // 1. identity 贡献
  score += result.identity * 0.6

  // 2. mismatch 惩罚
  score -= result.mismatch * 1

  // 3. gap 惩罚
  score -= result.gap * 0.5

  // 4. 长度覆盖率
  const refLen = result.referenceSequence?.length ?? 0
  const qryLen = result.querySequence?.length ?? 0
  const coverage = refLen > 0 && qryLen > 0
    ? Math.min(refLen, qryLen) / Math.max(refLen, qryLen)
    : 0
  score += coverage * 20

  // 5. 短序列完全匹配奖励
  //
  // 短序列（siRNA/primer/oligo，≤50bp）的 coverage 天然很低
  // （21nt Query vs 1000bp Reference = 0.021 coverage），
  // 导致完全匹配的结果可能被长 gap 结果掩盖。
  // 完全匹配（identity=100, gap=0）是强信号，应给予显著加分。
  if (qryLen > 0 && qryLen <= 50 && result.identity === 100 && result.gap === 0) {
    score += 20
  }

  return Number(Math.max(0, Math.min(100, score)).toFixed(2))
}
