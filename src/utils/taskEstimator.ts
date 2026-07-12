import type { SequenceItem } from '../types/sequence'

export type TaskLevel = 'small' | 'medium' | 'large'

export interface TaskEstimate {
  /** 总比较次数 = reference × query */
  total: number
  /** 任务规模等级 */
  level: TaskLevel
  /** 预计耗时（秒），粗略估算 */
  estimatedSeconds: number
  /** 是否建议后台计算 */
  suggestBackground: boolean
  /** 等级对应的描述 key（i18n） */
  levelKey: 'taskLevelSmall' | 'taskLevelMedium' | 'taskLevelLarge'
}

/**
 * 评估比对任务量
 * 基于参考序列数 × 查询序列数（配对比对场景下为 min(ref, query)）
 * 这里采用配对场景：total = min(ref, query) × methods
 */
export function estimateTask(
  reference: SequenceItem[] | number,
  query: SequenceItem[] | number,
  methodCount = 1,
): TaskEstimate {
  const refCount = typeof reference === 'number' ? reference : reference.length
  const queryCount = typeof query === 'number' ? query : query.length

  // 配对比对：任务量 = 对数 × 方法数
  const pairs = Math.min(refCount, queryCount)
  const total = pairs * methodCount

  let level: TaskLevel = 'small'
  let levelKey: TaskEstimate['levelKey'] = 'taskLevelSmall'
  let estimatedSeconds = Math.max(0.1, total * 0.0005)
  let suggestBackground = false

  if (total < 1000) {
    level = 'small'
    levelKey = 'taskLevelSmall'
  } else if (total < 100000) {
    level = 'medium'
    levelKey = 'taskLevelMedium'
  } else {
    level = 'large'
    levelKey = 'taskLevelLarge'
    suggestBackground = true
  }

  // 大任务时间估算更保守
  if (level === 'large') {
    estimatedSeconds = total * 0.001
  } else if (level === 'medium') {
    estimatedSeconds = total * 0.0008
  }

  return {
    total,
    level,
    estimatedSeconds: Math.round(estimatedSeconds * 10) / 10,
    suggestBackground,
    levelKey,
  }
}

/** 格式化耗时为人类可读字符串 */
export function formatDuration(seconds: number): string {
  if (seconds < 1) return '< 1s'
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remain = Math.round(seconds % 60)
  if (minutes < 60) return `${minutes}m ${remain}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}
