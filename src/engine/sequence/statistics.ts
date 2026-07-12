// 计算 GC 含量（百分比）
export function calcGC(seq: string): number {
  const clean = seq.toUpperCase()
  if (!clean) return 0
  const gc = (clean.match(/[GC]/g) || []).length
  return Number(((gc / clean.length) * 100).toFixed(2))
}

// 判断序列类型
export function detectType(seq: string): 'DNA' | 'RNA' | 'UNKNOWN' {
  if (!seq) return 'UNKNOWN'
  if (seq.includes('U')) return 'RNA'
  if (seq.match(/[ATCG]/)) return 'DNA'
  return 'UNKNOWN'
}
