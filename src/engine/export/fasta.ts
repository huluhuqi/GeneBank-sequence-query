import type { SequenceItem } from '../../types/sequence'
import { createFileName, downloadText } from './utils'

export function exportFASTA(items: SequenceItem[]) {
  let text = ''
  items.forEach((item) => {
    text += `>${item.name}\n`
    // 每行 60 个字符
    const seq = item.sequence
    for (let i = 0; i < seq.length; i += 60) {
      text += seq.substring(i, i + 60) + '\n'
    }
  })
  downloadText(text, createFileName('Sequences', 'fasta'), 'text/plain;charset=utf-8;')
}
