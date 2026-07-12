import type { AlignmentResult } from '../../types/alignment'

/**
 * 结果去重
 *
 * 当多个算法产生完全相同的结果（identity、match、mismatch、gap、坐标、方向都相同）时，
 * 只保留一个，避免信息冗余。
 *
 * 注意：key 包含坐标和方向，避免不同位置的结果被错误合并。
 * 保留优先级更高的算法结果。
 */
export function removeDuplicateResults(
  results: AlignmentResult[],
  priority: Record<string, number>,
): AlignmentResult[] {
  const map = new Map<string, AlignmentResult>()

  for (const r of results) {
    // key 包含位置坐标、方向和质量指标，避免不同位置结果被错误合并
    // 坐标在前，确保不同位置的结果一定保留
    const key = [
      r.referenceStart,
      r.referenceEnd,
      r.queryStart,
      r.queryEnd,
      r.identity,
      r.match,
      r.mismatch,
      r.gap,
      r.orientation,
    ].join('_')
    const existing = map.get(key)

    if (!existing) {
      map.set(key, r)
      continue
    }

    // 已有相同结果，保留优先级更高的
    const existingPrio = priority[existing.method] ?? 0
    const currentPrio = priority[r.method] ?? 0
    if (currentPrio > existingPrio) {
      map.set(key, r)
    }
  }

  return Array.from(map.values())
}
