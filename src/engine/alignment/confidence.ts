/**
 * 可信度等级
 *
 * 基于 qualityScore 评定：
 * - High:   ≥85
 * - Medium: ≥60
 * - Low:    <60
 */
export function getConfidence(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 85) return 'High'
  if (score >= 60) return 'Medium'
  return 'Low'
}
