import type { SequenceItem } from '../../types/sequence'
import { cleanSequence } from '../../engine/preprocess/cleanSequence'
import { calcGC, detectType } from '../../engine/sequence/statistics'

export interface CreateSequenceItemOptions {
  id: string
  sequence: string
  source: 'file' | 'paste' | 'manual'
  fileName?: string
  index: number
  name?: string
}

/**
 * 统一创建 SequenceItem
 * 自动完成序列清洗、统计计算、字段填充
 */
export function createSequenceItem(options: CreateSequenceItemOptions): SequenceItem {
  const cleaned = cleanSequence(options.sequence)
  return {
    id: options.id,
    name: options.name ?? options.id,
    originalSequence: cleaned,
    sequence: cleaned,
    length: cleaned.length,
    type: detectType(cleaned),
    gc: calcGC(cleaned),
    source: options.source,
    fileName: options.fileName,
    index: options.index,
    createdAt: new Date().toISOString(),
    operations: [],
  }
}
