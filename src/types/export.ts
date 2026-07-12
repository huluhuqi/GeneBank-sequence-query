export interface ExportOption {
  includeAlignment: boolean
  includeStatistics: boolean
  includeOriginalSequence: boolean
  onlyBestResult: boolean
}

export type ExportMode = 'all' | 'filtered' | 'selected' | 'best'
export type ExportFormat = 'excel' | 'csv' | 'fasta' | 'json'

export const defaultExportOption: ExportOption = {
  includeAlignment: true,
  includeStatistics: true,
  includeOriginalSequence: false,
  onlyBestResult: false,
}
