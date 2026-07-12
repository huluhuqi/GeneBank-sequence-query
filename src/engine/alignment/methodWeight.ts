import type { AlignmentResult } from '../../types/alignment'

/**
 * 算法权重
 *
 * SnapGene 全局比对适合判断完整匹配，权重最高
 * Local 容易产生局部虚高，权重降低
 */
export const methodWeight: Record<AlignmentResult['method'], number> = {
  SnapGene: 1.1,
  Sliding: 1,
  'Reverse Complement': 1,
  Local: 0.9,
}
