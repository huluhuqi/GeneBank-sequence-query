import type { AlignmentResult } from '../../types/alignment'

/**
 * 冲突检测
 *
 * 当多个算法的 qualityScore 差异超过 30 分时，
 * 认为算法间存在冲突（如 Local 局部虚高 vs SnapGene 全局匹配）。
 */
export function detectConflict(results: AlignmentResult[]): boolean {
  if (results.length < 2) return false

  const scores = results.map((r) => r.qualityScore ?? 0)
  const max = Math.max(...scores)
  const min = Math.min(...scores)

  return max - min > 30
}
