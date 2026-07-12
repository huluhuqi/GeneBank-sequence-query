import { createSequenceItem } from './sequenceFactory'
import { generateSequenceId } from '../sequenceId'
import { normalizeSequence } from './sequenceValidator'
import { parseTSV } from './tsvParser'
import type { SequenceItem } from '../../types/sequence'

/**
 * 纯文本导入：每行作为一条独立序列
 *
 * 修复点（Step 5）：
 * 1. 使用 TSV 解析器，正确处理 Excel 单元格内引号包裹的换行
 * 2. 序列标准化：去除空白、转大写
 * 3. 过滤空行
 *
 * 自动编号：Reference-20260712-001
 */
export function parseTextSequence(
  text: string,
  type: 'Reference' | 'Query',
  fileName?: string,
): SequenceItem[] {
  const rows = parseTSV(text)
  const result: SequenceItem[] = []
  let index = 0

  for (const row of rows) {
    // 纯文本模式：每行的第一列作为序列
    const rawSeq = row.columns[0] || ''
    const sequence = normalizeSequence(rawSeq)

    if (!sequence) continue

    index++
    result.push(
      createSequenceItem({
        id: generateSequenceId(type, index),
        sequence,
        source: 'file',
        fileName,
        index,
      }),
    )
  }

  return result
}
