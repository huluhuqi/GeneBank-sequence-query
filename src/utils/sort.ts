import type { AlignmentResult } from '../types/alignment'

// 通用排序：支持数字和字符串字段
export function sortResult(
  data: AlignmentResult[],
  field: keyof AlignmentResult,
  order: 'asc' | 'desc' = 'desc',
): AlignmentResult[] {
  const factor = order === 'desc' ? -1 : 1
  return [...data].sort((a, b) => {
    const va = a[field]
    const vb = b[field]
    if (typeof va === 'number' && typeof vb === 'number') {
      return (va - vb) * factor
    }
    return String(va).localeCompare(String(vb)) * factor
  })
}
