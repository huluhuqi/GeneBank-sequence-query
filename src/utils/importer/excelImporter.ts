import { createSequenceItem } from './sequenceFactory'
import { generateSequenceId } from '../sequenceId'
import { normalizeSequence } from './sequenceValidator'
import { parseTSV } from './tsvParser'
import type { SequenceItem } from '../../types/sequence'

/**
 * Excel 粘贴解析
 *
 * 修复点（Step 5）：
 * 1. 使用 TSV 解析器，正确处理 Excel 单元格内引号包裹的换行
 * 2. 序列标准化：去除空白、转大写
 * 3. 双列：第一列作为 ID/Name，最后一列作为序列
 * 4. 单列：自动编号生成 ID
 *
 * 格式说明：
 * - 双列（ID\tSequence）：第一列作为 ID，最后一列作为序列
 * - 单列：自动编号生成 ID
 */
export function parseExcelPaste(
  text: string,
  type: 'Reference' | 'Query',
): SequenceItem[] {
  const rows = parseTSV(text)
  const result: SequenceItem[] = []
  const twoColumn = rows.some((r) => r.isMultiColumn)

  rows.forEach((row, index) => {
    if (twoColumn && row.isMultiColumn) {
      const id = row.columns[0].trim()
      // 最后一列作为序列（兼容中间列如 Description）
      const rawSeq = row.columns[row.columns.length - 1]
      const sequence = normalizeSequence(rawSeq)

      if (!sequence) return

      result.push(
        createSequenceItem({
          id: id || generateSequenceId(type, index + 1),
          sequence,
          source: 'paste',
          index: index + 1,
          name: id || undefined,
        }),
      )
    } else {
      // 单列或降级处理
      const rawSeq = row.columns[0] || ''
      const sequence = normalizeSequence(rawSeq)

      if (!sequence) return

      result.push(
        createSequenceItem({
          id: generateSequenceId(type, index + 1),
          sequence,
          source: 'paste',
          index: index + 1,
        }),
      )
    }
  })

  return result
}
