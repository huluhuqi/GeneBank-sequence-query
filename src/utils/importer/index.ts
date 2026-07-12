export { createSequenceItem } from './sequenceFactory'
export type { CreateSequenceItemOptions } from './sequenceFactory'
export { parseFasta } from './fastaImporter'
export { parseTextSequence } from './textImporter'
export { parseExcelPaste } from './excelImporter'
export { parseTSV, isMultiColumnTSV } from './tsvParser'
export type { TSVRow } from './tsvParser'
export { normalizeSequence, validateSequence, sanitizeSequence, findInvalidChars } from './sequenceValidator'
export { removeDuplicateIds } from '../sequence/checkDuplicateId'
export { validateItems } from '../sequence/validateItems'

/**
 * 导入前文本内容校验
 * 空文件或纯空白内容直接抛错，避免静默成功
 */
export function assertNonEmpty(text: string): void {
  if (!text || !text.trim()) {
    throw new Error('文件内容为空')
  }
}
