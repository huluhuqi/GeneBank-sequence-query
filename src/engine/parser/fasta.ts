import type { SequenceItem } from '../../types/sequence'

export function parseFasta(text: string): SequenceItem[] {
  const result: SequenceItem[] = []
  const lines = text.replace(/\r/g, '').split('\n')

  let name = ''
  let seq = ''

  function push() {
    if (!name) return
    result.push({
      id: crypto.randomUUID(),
      name,
      originalSequence: seq,
      sequence: seq,
      length: seq.length,
      type: 'UNKNOWN',
      gc: 0,
      source: 'paste',
      index: result.length,
      createdAt: new Date().toISOString(),
      operations: [],
    })
  }

  for (const line of lines) {
    if (line.startsWith('>')) {
      push()
      name = line.substring(1).trim()
      seq = ''
    } else {
      seq += line.trim()
    }
  }

  push()
  return result
}
