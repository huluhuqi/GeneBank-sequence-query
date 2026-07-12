import type { AlignmentResult } from '../../types/alignment'
import type { SequenceItem } from '../../types/sequence'
import type { ExportOption } from '../../types/export'
import { createFileName, downloadText } from './utils'

interface JsonExportParams {
  results: AlignmentResult[]
  references?: SequenceItem[]
  queries?: SequenceItem[]
  option: ExportOption
}

export function exportJSON({ results, references, queries, option }: JsonExportParams) {
  const data: Record<string, unknown> = {
    exportDate: new Date().toISOString(),
    resultCount: results.length,
    results,
  }

  if (option.includeStatistics) {
    const identities = results.map((r) => r.identity)
    data.statistics = {
      totalPairs: results.length,
      averageIdentity: results.length > 0
        ? Number((identities.reduce((a, b) => a + b, 0) / results.length).toFixed(2))
        : 0,
      highestIdentity: results.length > 0 ? Math.max(...identities) : 0,
      lowestIdentity: results.length > 0 ? Math.min(...identities) : 0,
    }
  }

  if (option.includeOriginalSequence) {
    data.references = references
    data.queries = queries
  }

  downloadText(
    JSON.stringify(data, null, 2),
    createFileName('SequenceAlignment', 'json'),
    'application/json',
  )
}
