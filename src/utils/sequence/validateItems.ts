import type { SequenceItem } from '../../types/sequence'

/**
 * 输入数据完整性校验
 *
 * 过滤掉缺少 ID 或序列为空的无效项
 */
export function validateItems(items: SequenceItem[]): SequenceItem[] {
  return items.filter((item) => {
    return item.id && item.sequence && item.sequence.length > 0
  })
}
