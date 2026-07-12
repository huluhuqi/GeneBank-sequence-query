import type { AlignmentResult } from '../../types/alignment'

/**
 * 算法权重
 *
 * SnapGene 半全局 DP 比对最全面（处理 gap + indel），权重最高
 * Local seed+extend 次之（能找 seed 但不处理 gap）
 * Reverse Complement 方向验证，权重适中
 * Sliding 最简单（不能处理 gap/indel），权重最低
 *
 * 排序：SnapGene > Local ≈ RC > Sliding
 */
export const methodWeight: Record<AlignmentResult['method'], number> = {
  SnapGene: 1.15,
  Local: 1.05,
  'Reverse Complement': 1.05,
  Sliding: 1.0,
}
