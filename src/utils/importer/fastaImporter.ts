import { createSequenceItem } from './sequenceFactory'
import { generateSequenceId } from '../sequenceId'
import { normalizeSequence } from './sequenceValidator'
import type { SequenceItem } from '../../types/sequence'

/**
 * FASTA 格式导入
 * >Header 行作为 ID，后续行为序列
 * 无 Header 时用文件名或自动编号
 *
 * 修复点（Step 5）：
 * - 序列标准化：去除空白、转大写
 */
export function parseFasta(
  text: string,
  type: 'Reference' | 'Query',
  fileName?: string,
): SequenceItem[] {
  const result: SequenceItem[] = []
  const blocks = text.split('>').filter((v) => v.trim())

  blocks.forEach((block, index) => {
    const lines = block.split(/\r?\n/)
    const header = lines.shift()?.trim()
    const sequence = normalizeSequence(lines.join(''))

    if (!sequence) return

    // 无 header 时使用唯一 ID 生成器，避免多序列无 header 时 ID 重复
    const id = header || generateSequenceId(type, index + 1)

    result.push(
      createSequenceItem({
        id,
        sequence,
        source: 'file',
        fileName,
        index: index + 1,
        name: header || id,
      }),
    )
  })

  return result
}
