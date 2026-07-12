export interface BasePair {
  /** 位置索引（从 0 开始） */
  index: number
  /** Reference 碱基 */
  refBase: string
  /** Query 碱基 */
  queryBase: string
  /** 是否匹配 */
  match: boolean
  /** 是否为 gap（'-'） */
  isGap: boolean
}

/**
 * 逐碱基比较两条已对齐序列，返回每个位置的匹配状态
 */
export function compareAlignment(ref: string, query: string): BasePair[] {
  const len = Math.max(ref.length, query.length)
  const result: BasePair[] = []
  for (let i = 0; i < len; i++) {
    const refBase = ref[i] || '-'
    const queryBase = query[i] || '-'
    result.push({
      index: i,
      refBase,
      queryBase,
      match: refBase === queryBase && refBase !== '-' && queryBase !== '-',
      isGap: refBase === '-' || queryBase === '-',
    })
  }
  return result
}

/**
 * 生成匹配线（| 表示匹配，空格表示不匹配，- 表示 gap）
 */
export function generateMatchLine(ref: string, query: string): string {
  const len = Math.max(ref.length, query.length)
  let line = ''
  for (let i = 0; i < len; i++) {
    const r = ref[i] || '-'
    const q = query[i] || '-'
    if (r === '-' || q === '-') {
      line += '-'
    } else if (r === q) {
      line += '|'
    } else {
      line += ' '
    }
  }
  return line
}

/**
 * 统计错配位置列表
 */
export function getMismatchPositions(ref: string, query: string): number[] {
  const positions: number[] = []
  const len = Math.max(ref.length, query.length)
  for (let i = 0; i < len; i++) {
    const r = ref[i] || '-'
    const q = query[i] || '-'
    if (r !== q && r !== '-' && q !== '-') {
      positions.push(i + 1) // 1-based
    }
  }
  return positions
}
