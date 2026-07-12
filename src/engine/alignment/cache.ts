import type { AlignmentResult } from '../../types/alignment'

/**
 * SnapGene 比对结果缓存
 *
 * 批量场景下相同 (reference, query) 对可能重复出现，
 * 缓存避免重复执行 O(M×N) 的 DP 计算。
 */
const cache = new Map<string, AlignmentResult>()

export function getCache(key: string): AlignmentResult | undefined {
  return cache.get(key)
}

export function setCache(key: string, value: AlignmentResult): void {
  cache.set(key, value)
}

export function clearCache(): void {
  cache.clear()
}
