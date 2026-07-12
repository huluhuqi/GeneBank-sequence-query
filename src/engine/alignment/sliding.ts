import type { AlignmentResult } from '../../types/alignment'
import { compareSequence } from './statistics'
import { findSeed } from './kmer'
import { calculateCoordinates } from './coordinate'

// 滑动窗口比对：在 reference 上滑动 query，找最佳匹配位置
export function slidingAlignment(
  reference: string,
  query: string,
  method: 'Sliding' | 'Reverse Complement' = 'Sliding',
): AlignmentResult | null {
  // Step 4.9：输入保护
  if (!reference || !query || query.length === 0) {
    return null
  }

  // Query 比 Reference 长，无法比对
  if (query.length > reference.length) {
    return {
      id: crypto.randomUUID(),
      referenceName: '',
      queryName: '',
      method,
      identity: 0,
      score: 0,
      match: 0,
      mismatch: query.length,
      gap: 0,
      referenceStart: 0,
      referenceEnd: 0,
      queryStart: 0,
      queryEnd: 0,
      alignedReference: '',
      alignedQuery: '',
      orientation: method === 'Reverse Complement' ? 'Reverse Complement' : 'Forward',
    }
  }

  let best: {
    startIndex: number
    match: number
    mismatch: number
    identity: number
    score: number
  } | null = null

  // k-mer seed 快速过滤：先找前 6bp 是否存在
  const seedLen = Math.min(6, query.length)
  const seed = query.substring(0, seedLen)
  const seedPos = findSeed(reference, seed)

  const maxI = reference.length - query.length

  // Step 4.6：seed 命中时优先扫描 seed 附近，否则全量滑动
  let positions: number[]
  if (seedPos >= 0) {
    // seed 命中：扫描 seed 附近 ±query.length 范围（覆盖可能的移位匹配）
    const window = query.length
    const start = Math.max(0, seedPos - window)
    const end = Math.min(maxI, seedPos + window)
    positions = []
    for (let i = start; i <= end; i++) positions.push(i)
  } else {
    // seed 未命中：全量滑动
    positions = Array.from({ length: maxI + 1 }, (_, i) => i)
  }

  for (const i of positions) {
    const refSlice = reference.substring(i, i + query.length)
    const { match, mismatch, identity } = compareSequence(refSlice, query)

    if (!best || identity > best.identity) {
      best = {
        startIndex: i,
        match,
        mismatch,
        identity: Number(identity.toFixed(2)),
        score: match - mismatch,
      }
    }
  }

  if (!best) {
    return null
  }

  const b = best
  const alignedReference = reference.substring(b.startIndex, b.startIndex + query.length)
  const alignedQuery = query
  const coords = calculateCoordinates(alignedReference, alignedQuery)

  // 注意：calculateCoordinates 返回的是相对 alignment 字符串的 1-based 位置，
  // 对于滑动比对，reference 的实际位置需要加上 startIndex
  const referenceStart = b.startIndex + coords.referenceStart
  const referenceEnd = b.startIndex + coords.referenceEnd

  return {
    id: crypto.randomUUID(),
    referenceName: '',
    queryName: '',
    method,
    identity: b.identity,
    score: b.score,
    match: b.match,
    mismatch: b.mismatch,
    gap: 0, // Sliding 无 gap
    referenceStart,
    referenceEnd,
    queryStart: coords.queryStart,
    queryEnd: coords.queryEnd,
    alignedReference,
    alignedQuery,
    orientation: method === 'Reverse Complement' ? 'Reverse Complement' : 'Forward',
  }
}
