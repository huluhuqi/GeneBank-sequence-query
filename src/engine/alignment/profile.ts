export interface SequenceProfile {
  /** 序列长度 */
  length: number
  /** GC 含量百分比（0~100） */
  gc: number
  /** 长度分类 */
  category: 'short' | 'medium' | 'long'
}

/**
 * 序列特征分析
 *
 * 批量任务中可提前对所有序列进行 profiling，
 * 不同分类采用不同算法策略。
 */
export function getSequenceProfile(seq: string): SequenceProfile {
  const length = seq.length

  const gcMatches = seq.match(/[GCgc]/g)
  const gc = length > 0
    ? Number(((gcMatches?.length ?? 0) / length * 100).toFixed(2))
    : 0

  let category: SequenceProfile['category'] = 'medium'
  if (length <= 100) category = 'short'
  else if (length > 1000) category = 'long'

  return { length, gc, category }
}
