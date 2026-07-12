// k-mer seed 快速过滤：在 reference 中查找 seed 的位置
export function findSeed(reference: string, seed: string): number {
  return reference.indexOf(seed)
}

// 收集所有 seed 命中位置
export function findAllSeeds(reference: string, seed: string): number[] {
  const positions: number[] = []
  let idx = reference.indexOf(seed)
  while (idx !== -1) {
    positions.push(idx)
    idx = reference.indexOf(seed, idx + 1)
  }
  return positions
}
