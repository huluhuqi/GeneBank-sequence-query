import type { SequenceItem } from '../types/sequence'

/**
 * 批量重命名：按顺序生成新 ID
 * @param items 序列列表
 * @param prefix 前缀，如 "Mouse_AGT"
 * @param start 起始编号（默认 1）
 * @param pad 编号补零位数（默认 3，生成 001）
 * @returns 新的 SequenceItem 数组（不修改原数组）
 */
export function batchRename(
  items: SequenceItem[],
  prefix: string,
  start = 1,
  pad = 3,
): SequenceItem[] {
  return items.map((item, index) => ({
    ...item,
    id: `${prefix}_${String(start + index).padStart(pad, '0')}`,
    name: `${prefix}_${String(start + index).padStart(pad, '0')}`,
  }))
}

/**
 * 预览批量重命名的前 N 个结果
 */
export function previewBatchRename(
  count: number,
  prefix: string,
  start = 1,
  pad = 3,
): string[] {
  return Array.from({ length: Math.min(count, 5) }, (_, i) =>
    `${prefix}_${String(start + i).padStart(pad, '0')}`,
  )
}
