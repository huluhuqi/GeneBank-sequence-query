import type { AlignmentResult } from '../../types/alignment'

/**
 * 算法优先级
 *
 * 当多个算法 qualityScore 相同时，优先级高的排前面。
 *
 * SnapGene 全局比对最全面，优先级最高
 * Local 局部比对次之
 * Sliding 滑动窗口再次
 * Reverse Complement 仅作方向验证，最低
 */
export const methodPriority: Record<AlignmentResult['method'], number> = {
  SnapGene: 4,
  Local: 3,
  Sliding: 2,
  'Reverse Complement': 1,
}
