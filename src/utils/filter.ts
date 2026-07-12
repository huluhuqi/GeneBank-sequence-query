/**
 * 长度比例过滤：Query 长度 / Reference 长度需 >= minRatio
 * 避免短序列与长序列的无意义比对
 */
export function lengthFilter(ref: string, query: string, minRatio = 0.5): boolean {
  if (ref.length === 0 || query.length === 0) return false
  const ratio = query.length / ref.length
  return ratio >= minRatio
}

/**
 * 创建序列的 k-mer 集合
 * @param seq 序列字符串
 * @param k k-mer 长度（默认 8）
 */
export function createKmerSet(seq: string, k = 8): Set<string> {
  const result = new Set<string>()
  if (seq.length < k) {
    // 序列短于 k，直接加入整个序列
    if (seq.length > 0) result.add(seq)
    return result
  }
  for (let i = 0; i <= seq.length - k; i++) {
    result.add(seq.substring(i, i + k))
  }
  return result
}

/**
 * 两个 k-mer 集合是否有交集（快速预筛选）
 */
export function kmerMatch(a: Set<string>, b: Set<string>): boolean {
  // 遍历较小的集合以提升性能
  const smaller = a.size < b.size ? a : b
  const larger = a.size < b.size ? b : a
  for (const kmer of smaller) {
    if (larger.has(kmer)) return true
  }
  return false
}

/**
 * 综合预筛选：长度过滤 + k-mer 匹配
 * @returns true 表示通过预筛选，应进行完整比对
 */
export function preFilter(
  ref: string,
  query: string,
  options?: { minRatio?: number; k?: number; refKmers?: Set<string>; queryKmers?: Set<string> },
): boolean {
  const minRatio = options?.minRatio ?? 0.3
  const k = options?.k ?? 8

  // 长度过滤
  if (!lengthFilter(ref, query, minRatio)) return false

  // k-mer 预筛选
  const refKmers = options?.refKmers ?? createKmerSet(ref, k)
  const queryKmers = options?.queryKmers ?? createKmerSet(query, k)

  return kmerMatch(refKmers, queryKmers)
}
