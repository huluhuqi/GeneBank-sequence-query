import type { SequenceItem } from '../../types/sequence'
import { parseFasta } from './fasta'

// 纯文本解析：单条序列直接作为一条，多条按 FASTA 处理
export function parseText(text: string): SequenceItem[] {
  const trimmed = text.trim()

  // 含 > 开头的行，按 FASTA 解析
  if (trimmed.includes('>')) {
    return parseFasta(trimmed)
  }

  // 纯文本单条序列：去除所有空白后作为一条
  const seq = trimmed.replace(/\s/g, '')
  if (!seq) return []

  return [
    {
      id: crypto.randomUUID(),
      name: 'Untitled',
      originalSequence: seq,
      sequence: seq,
      length: seq.length,
      type: 'UNKNOWN',
      gc: 0,
      source: 'paste',
      index: 0,
      createdAt: new Date().toISOString(),
      operations: [],
    },
  ]
}
