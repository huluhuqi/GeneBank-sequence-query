// 比对专用统计：比较两条等长序列
export function compareSequence(a: string, b: string) {
  let match = 0
  let mismatch = 0

  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      match++
    } else {
      mismatch++
    }
  }

  const gap = 0
  return {
    match,
    mismatch,
    gap,
    identity: calculateIdentity(match, mismatch, gap),
  }
}

/**
 * 统一 identity 计算
 *
 * 公式：match / (match + mismatch + gap) × 100
 *
 * 符合 BLAST / SnapGene 显示逻辑：
 * - gap 参与分母计算
 * - 三种算法（Sliding / Local / SnapGene）使用相同公式
 */
export function calculateIdentity(
  match: number,
  mismatch: number,
  gap: number,
): number {
  const total = match + mismatch + gap

  if (total === 0) {
    return 0
  }

  return Number(((match / total) * 100).toFixed(2))
}
