import * as XLSX from 'xlsx'
import type { AlignmentResult } from '../../types/alignment'
import type { SequenceItem } from '../../types/sequence'
import type { ExportOption } from '../../types/export'
import { createFileName } from './utils'
import { reverseComplement } from '../sequence/reverseComplement'

interface ExportParams {
  results: AlignmentResult[]
  references?: SequenceItem[]
  queries?: SequenceItem[]
  option: ExportOption
}

/** 空值保护：undefined / null 转为空字符串 */
function safe(value: unknown): string | number {
  if (value === undefined || value === null) return ''
  return value as string | number
}

export function exportExcel({ results, references, queries, option }: ExportParams) {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Result（含 Reference ID / Query ID / Orientation / Quality Score）
  const resultData = results.map((r, i) => ({
    ID: i + 1,
    'Reference ID': r.referenceId ?? r.referenceName ?? '',
    'Query ID': r.queryId ?? r.queryName ?? '',
    'Reference Name': r.referenceName,
    'Query Name': r.queryName,
    Method: r.method,
    Orientation: r.orientation ?? '-',
    Identity: r.identity,
    Match: r.match,
    Mismatch: r.mismatch,
    Gap: r.gap,
    Score: r.score,
    'Quality Score': r.qualityScore ?? 0,
    'Ref Start': safe(r.referenceStart),
    'Ref End': safe(r.referenceEnd),
    'Query Start': safe(r.queryStart),
    'Query End': safe(r.queryEnd),
  }))
  const wsResult = XLSX.utils.json_to_sheet(resultData)
  XLSX.utils.book_append_sheet(workbook, wsResult, 'Result')

  // Sheet 2: Statistics
  if (option.includeStatistics) {
    const total = results.length
    const identities = results.map((r) => r.identity)
    const avg = total > 0 ? (identities.reduce((a, b) => a + b, 0) / total).toFixed(2) : '0'
    const highest = total > 0 ? Math.max(...identities) : 0
    const lowest = total > 0 ? Math.min(...identities) : 0

    const statsData = [
      { Metric: 'Total Pairs', Value: total },
      { Metric: 'Average Identity', Value: `${avg}%` },
      { Metric: 'Highest Identity', Value: `${highest}%` },
      { Metric: 'Lowest Identity', Value: `${lowest}%` },
    ]
    const wsStats = XLSX.utils.json_to_sheet(statsData)
    XLSX.utils.book_append_sheet(workbook, wsStats, 'Statistics')
  }

  // Sheet 3: Alignment（使用 ID 匹配 + 统一 reverseComplement + 空坐标保护）
  if (option.includeAlignment && references && queries) {
    const alignData = results.map((r) => {
      // 优先使用 ID 匹配（精确），回退到 name 匹配（兼容旧数据）
      const refItem =
        references.find((s) => s.id === r.referenceId) ??
        references.find((s) => s.name === r.referenceName)
      const queryItem =
        queries.find((s) => s.id === r.queryId) ??
        queries.find((s) => s.name === r.queryName)

      // 空坐标保护
      if (!r.referenceStart || !r.referenceEnd) {
        return {
          Reference: r.referenceName,
          Query: r.queryName,
          'Ref Sequence': '',
          'Match Line': '',
          'Query Sequence': '',
          Identity: `${r.identity}%`,
        }
      }

      const refSeq = refItem
        ? refItem.sequence.substring(r.referenceStart - 1, r.referenceEnd)
        : ''
      let querySeq = queryItem ? queryItem.sequence : ''

      // 统一使用 reverseComplement 函数（支持完整 IUPAC）
      if ((r.orientation === 'Reverse Complement' || r.method === 'Reverse Complement') && queryItem) {
        querySeq = reverseComplement(querySeq)
      }

      const matchLine = refSeq
        .split('')
        .map((b, i) => (b === querySeq[i] ? '|' : ' '))
        .join('')

      return {
        Reference: r.referenceName,
        Query: r.queryName,
        'Ref Sequence': refSeq,
        'Match Line': matchLine,
        'Query Sequence': querySeq,
        Identity: `${r.identity}%`,
      }
    })
    const wsAlign = XLSX.utils.json_to_sheet(alignData)
    XLSX.utils.book_append_sheet(workbook, wsAlign, 'Alignment')
  }

  // Sheet 4: Sequences（可选）
  if (option.includeOriginalSequence && references && queries) {
    const seqData = [
      ...references.map((s) => ({ Type: 'Reference', Name: s.name, Sequence: s.sequence, Length: s.length, GC: s.gc, Type_DNA_RNA: s.type })),
      ...queries.map((s) => ({ Type: 'Query', Name: s.name, Sequence: s.sequence, Length: s.length, GC: s.gc, Type_DNA_RNA: s.type })),
    ]
    const wsSeq = XLSX.utils.json_to_sheet(seqData)
    XLSX.utils.book_append_sheet(workbook, wsSeq, 'Sequences')
  }

  XLSX.writeFile(workbook, createFileName('SequenceAlignment', 'xlsx'))
}
