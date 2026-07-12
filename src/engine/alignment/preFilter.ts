/**
 * SnapGene 快速预筛选
 *
 * 基于 k-mer 相似度判断两条序列是否值得执行完整 DP 比对。
 * 复杂度 O(M + N)，远低于 DP 的 O(M×N)。
 *
 * @returns 0~1 之间的相似度值，1 表示完全相同
 */
export function kmerSimilarity(seq1: string, seq2: string, k = 4): number {
  const set1 = new Set<string>()
  const set2 = new Set<string>()

  for (let i = 0; i <= seq1.length - k; i++) {
    set1.add(seq1.substring(i, i + k))
  }

  for (let i = 0; i <= seq2.length - k; i++) {
    set2.add(seq2.substring(i, i + k))
  }

  let common = 0
  set1.forEach((kmer) => {
    if (set2.has(kmer)) common++
  })

  const union = new Set([...set1, ...set2]).size
  if (union === 0) return 0

  return common / union
}
