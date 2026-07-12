import type { SequenceItem } from '../../types/sequence'
import { parseFasta } from './fasta'

export function parseClipboard(text: string): SequenceItem[] {
  // Excel 粘贴：含 tab 分隔，按行解析
  if (text.includes('\t')) {
    const rows = text.split(/\r?\n/).filter((v) => v.trim())
    return rows.map((row, index) => {
      const cols = row.split('\t')
      const seq = cols[cols.length - 1].replace(/\s/g, '')
      return {
        id: crypto.randomUUID(),
        name: cols[0] || `Sequence_${index + 1}`,
        originalSequence: seq,
        sequence: seq,
        length: seq.length,
        type: 'UNKNOWN' as const,
        gc: 0,
        source: 'paste' as const,
        index,
        createdAt: new Date().toISOString(),
        operations: [],
        selected: true,
      }
    })
  }

  // 非 Excel：尝试 FASTA 格式
  return parseFasta(text)
}
