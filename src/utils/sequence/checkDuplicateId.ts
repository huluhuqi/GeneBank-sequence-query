import type { SequenceItem } from '../../types/sequence'

/**
 * 去重序列 ID
 *
 * 当导入的序列中存在重复 ID（如多条无 header 的 FASTA 使用文件名作为 ID）时，
 * 为重复项追加随机后缀，保证所有 ID 唯一。
 */
export function removeDuplicateIds(items: SequenceItem[]): SequenceItem[] {
  const used = new Set<string>()

  return items.map((item) => {
    let id = item.id

    if (used.has(id)) {
      id = `${id}-${Math.random().toString(36).slice(2, 6)}`
    }

    used.add(id)

    return { ...item, id }
  })
}
