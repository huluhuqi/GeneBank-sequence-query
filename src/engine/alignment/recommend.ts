import type { AlignmentResult } from '../../types/alignment'

/**
 * 推荐最佳结果
 *
 * 按 qualityScore 降序排列，取第一条。
 */
export function recommendBest(results: AlignmentResult[]): AlignmentResult | null {
  if (results.length === 0) return null

  return [...results].sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0))[0]
}
