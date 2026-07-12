// 序列清洗：转大写、去空白、去连字符
export function cleanSequence(seq: string): string {
  return seq
    .toUpperCase()
    .replace(/\s/g, '')
    .replace(/-/g, '')
}

// 计算 GC 含量（百分比）
export function calcGcContent(seq: string): number {
  if (!seq) return 0
  const gc = (seq.match(/[GC]/g) || []).length
  return Math.round((gc / seq.length) * 1000) / 10
}

// 判断序列类型 DNA / RNA
export function detectType(seq: string): 'DNA' | 'RNA' | 'UNKNOWN' {
  if (!seq) return 'UNKNOWN'
  if (seq.includes('U')) return 'RNA'
  if (/^[ATCGNRYWSMK]+$/.test(seq)) return 'DNA'
  return 'UNKNOWN'
}
