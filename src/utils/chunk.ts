/**
 * 将数组分块为指定大小的子数组
 */
export function splitArray<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr]
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/**
 * 生成 [start, end) 的数字范围数组
 */
export function range(start: number, end: number): number[] {
  const result: number[] = []
  for (let i = start; i < end; i++) result.push(i)
  return result
}

/**
 * 生成分块索引区间
 * @returns [{start, end, index}] 每块的起止索引和块编号
 */
export function chunkIndices(total: number, chunkSize: number): { start: number; end: number; index: number }[] {
  const chunks: { start: number; end: number; index: number }[] = []
  let idx = 0
  for (let i = 0; i < total; i += chunkSize) {
    chunks.push({ start: i, end: Math.min(i + chunkSize, total), index: idx++ })
  }
  return chunks
}
