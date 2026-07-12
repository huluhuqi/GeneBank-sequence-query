import type { AlignmentResult } from '../../types/alignment'
import { createFileName, downloadText } from './utils'

/** 空值保护：undefined / null 转为空字符串 */
function safeValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  return String(value)
}

export function exportCSV(results: AlignmentResult[]) {
  const headers = [
    'ID', 'Reference ID', 'Query ID', 'Reference Name', 'Query Name',
    'Method', 'Orientation',
    'Identity', 'Match', 'Mismatch', 'Gap', 'Score', 'Quality Score',
    'Ref Start', 'Ref End', 'Query Start', 'Query End',
  ]

  const rows = results.map((r, i) => [
    i + 1,
    safeValue(r.referenceId ?? r.referenceName),
    safeValue(r.queryId ?? r.queryName),
    safeValue(r.referenceName),
    safeValue(r.queryName),
    safeValue(r.method),
    safeValue(r.orientation),
    safeValue(r.identity),
    safeValue(r.match),
    safeValue(r.mismatch),
    safeValue(r.gap),
    safeValue(r.score),
    safeValue(r.qualityScore ?? 0),
    safeValue(r.referenceStart),
    safeValue(r.referenceEnd),
    safeValue(r.queryStart),
    safeValue(r.queryEnd),
  ])

  // CSV 转义：含逗号的字段加引号
  const escape = (val: unknown) => {
    const s = String(val)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(','))
    .join('\n')

  // BOM 头确保 Excel 正确识别 UTF-8
  downloadText('\uFEFF' + csv, createFileName('SequenceAlignment', 'csv'), 'text/csv;charset=utf-8;')
}
