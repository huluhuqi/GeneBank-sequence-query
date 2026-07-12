// 比对专用统计：比较两条等长序列
export function compareSequence(a: string, b: string) {
  let match = 0
  let mismatch = 0
  let gap = 0

  for (let i = 0; i < a.length; i++) {
    const aBase = a[i]
    const bBase = b[i]

    if (aBase === '-' || bBase === '-') {
      gap++
    } else if (aBase === bBase) {
      match++
    } else {
      mismatch++
    }
  }

  return {
    match,
    mismatch,
    gap,
    identity: calculateIdentity(match, mismatch, gap),
  }
}

/**
 * 统一生物学 identity 计算
 *
 * 公式：match / (match + mismatch + gap) × 100
 *
 * gap 参与分母：含 gap 的比对区域，gap 占据对齐位置，应降低 identity。
 *
 * - match=21, mismatch=0, gap=12 → identity=63.64%
 * - match=18, mismatch=0, gap=5  → identity=78.26%
 * - match=10, mismatch=2, gap=0  → identity=83.33%
 */
export function calculateIdentity(
  match: number,
  mismatch: number,
  gap: number,
): number {
  const aligned = match + mismatch + gap

  if (aligned === 0) {
    return 0
  }

  return Number(((match / aligned) * 100).toFixed(2))
}

/**
 * 覆盖率计算
 *
 * 公式：(match + mismatch) / queryLength × 100
 *
 * 反映 Query 有多少比例参与了比对（含错配）。
 * gap 不计入覆盖（gap 是插入/缺失，不是 Query 碱基）。
 *
 * - Query=21bp, match=21, mismatch=0, gap=10 → coverage=100%
 * - Query=21bp, match=10, mismatch=0, gap=0 → coverage=47.62%
 */
export function calculateCoverage(
  queryLength: number,
  match: number,
  mismatch: number,
): number {
  if (queryLength === 0) {
    return 0
  }

  return Number(
    (((match + mismatch) / queryLength) * 100).toFixed(2),
  )
}
