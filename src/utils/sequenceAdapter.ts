import type { SequenceItem } from '../types/sequence'

/**
 * 从 SequenceItem[] 中提取纯序列字符串数组
 * 用于将数据层结构与算法层解耦，算法只接收 string[]
 */
export function extractSequences(items: SequenceItem[]): string[] {
  return items.map((item) => item.sequence)
}
