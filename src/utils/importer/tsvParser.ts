/**
 * TSV 解析器
 *
 * 解决 Excel 复制时的特殊格式问题：
 * 1. 单元格内换行：Excel 会对含换行的单元格用双引号包裹
 *    如 "ATCG\nGGCA" 会被作为一个字段，而非两条记录
 * 2. Tab 分隔列：\t 分隔不同列
 * 3. \r\n 或 \n 换行：统一处理
 *
 * 例：
 *   输入：ID\tSequence\nA1\t"ATCG\nGGCA"
 *   输出：[["ID","Sequence"], ["A1","ATCG\nGGCA"]]
 */
export interface TSVRow {
  /** 原始行文本（已去除首尾空白） */
  raw: string
  /** 列数据（已按 Tab 分割，但未去除单元格内换行） */
  columns: string[]
  /** 是否为多列（columns.length >= 2） */
  isMultiColumn: boolean
}

/**
 * 解析 TSV 文本为行数组
 * 正确处理双引号包裹的单元格内换行
 */
export function parseTSV(text: string): TSVRow[] {
  const rows: TSVRow[] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false
  let hasContent = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 转义的双引号 -> 单个 "
        currentCell += '"'
        i++
      } else {
        // 引号开/关
        inQuotes = !inQuotes
        hasContent = true
      }
      continue
    }

    if (char === '\t' && !inQuotes) {
      // 列分隔符
      currentRow.push(currentCell)
      currentCell = ''
      hasContent = true
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      // 行结束（处理 \r\n 和 \n）
      if (char === '\r' && nextChar === '\n') {
        i++
      }
      if (hasContent || currentCell) {
        currentRow.push(currentCell)
        const raw = currentRow.join('\t')
        rows.push({
          raw,
          columns: currentRow.map((c) => c),
          isMultiColumn: currentRow.length >= 2,
        })
      }
      currentRow = []
      currentCell = ''
      hasContent = false
      continue
    }

    currentCell += char
    hasContent = true
  }

  // 处理最后一行（无尾部换行的情况）
  if (hasContent || currentCell) {
    currentRow.push(currentCell)
    const raw = currentRow.join('\t')
    rows.push({
      raw,
      columns: currentRow.map((c) => c),
      isMultiColumn: currentRow.length >= 2,
    })
  }

  return rows
}

/**
 * 检测文本是否为多列 TSV 格式
 * 用于 SequenceInput 自动选择导入器
 */
export function isMultiColumnTSV(text: string): boolean {
  const rows = parseTSV(text)
  // 至少有一行是多列才认为是 TSV
  return rows.some((r) => r.isMultiColumn)
}
