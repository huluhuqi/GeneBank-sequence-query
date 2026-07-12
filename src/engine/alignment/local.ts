import type { AlignmentResult } from '../../types/alignment'
import { compareSequence } from './statistics'
import { findAllSeeds } from './kmer'
import { calculateCoordinates } from './coordinate'

// Local Alignment: Seed + Extend 策略
// 找到种子位置后向左右延伸，寻找最大匹配区域
export function localAlignment(
  reference: string,
  query: string,
): AlignmentResult | null {
  // Step 4.9：输入保护
  if (!reference || !query || query.length === 0) {
    return null
  }

  if (query.length > reference.length) {
    return {
      id: crypto.randomUUID(),
      referenceName: '',
      queryName: '',
      method: 'Local',
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
      orientation: 'Forward',
    }
  }

  // 取 query 中间 6bp 作为 seed
  const seedLen = Math.min(6, query.length)
  const seedStart = Math.floor((query.length - seedLen) / 2)
  const seed = query.substring(seedStart, seedStart + seedLen)

  const seedPositions = findAllSeeds(reference, seed)

  let best: {
    startIndex: number
    match: number
    mismatch: number
    identity: number
    score: number
  } | null = null

  // 对每个 seed 位置，向左右延伸
  for (const seedPos of seedPositions) {
    // query 在 reference 上的起始位置（seed 对齐）
    let start = seedPos - seedStart
    if (start < 0) start = 0
    const maxStart = reference.length - query.length
    if (start > maxStart) start = maxStart

    // 精确比对这个位置
    const refSlice = reference.substring(start, start + query.length)
    const { match, mismatch, identity } = compareSequence(refSlice, query)

    if (!best || identity > best.identity) {
      best = {
        startIndex: start,
        match,
        mismatch,
        identity: Number(identity.toFixed(2)),
        score: match - mismatch,
      }
    }
  }

  // 如果 seed 未找到，回退到滑动
  if (!best) {
    const maxI = reference.length - query.length
    for (let i = 0; i <= maxI; i++) {
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
  }

  const b = best
  if (!b) {
    return null
  }

  const alignedReference = reference.substring(b.startIndex, b.startIndex + query.length)
  const alignedQuery = query
  const coords = calculateCoordinates(alignedReference, alignedQuery)

  // 局部比对：reference 坐标需要加上起始偏移
  const referenceStart = b.startIndex + coords.referenceStart
  const referenceEnd = b.startIndex + coords.referenceEnd

  return {
    id: crypto.randomUUID(),
    referenceName: '',
    queryName: '',
    method: 'Local',
    identity: b.identity,
    score: b.score,
    match: b.match,
    mismatch: b.mismatch,
    gap: 0,
    referenceStart,
    referenceEnd,
    queryStart: coords.queryStart,
    queryEnd: coords.queryEnd,
    alignedReference,
    alignedQuery,
    orientation: 'Forward',
  }
}
