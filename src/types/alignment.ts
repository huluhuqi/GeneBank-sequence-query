export interface AlignmentResult {
  id: string
  referenceName: string
  queryName: string

  /** 关联的 Reference SequenceItem ID */
  referenceId?: string
  /** 关联的 Query SequenceItem ID */
  queryId?: string

  /** 参与比对的原始 Reference 序列 */
  referenceSequence?: string
  /** 参与比对的原始 Query 序列 */
  querySequence?: string

  method: "Sliding" | "Local" | "Reverse Complement" | "SnapGene"

  identity: number
  score: number

  match: number
  mismatch: number
  gap: number

  /** Reference 匹配区域起始位置（1-based） */
  referenceStart?: number
  /** Reference 匹配区域结束位置（1-based） */
  referenceEnd?: number

  /** Query 参与比对的起始位置（1-based） */
  queryStart?: number
  /** Query 参与比对的结束位置（1-based） */
  queryEnd?: number

  alignedReference: string
  alignedQuery: string

  /** 相似度（含错配部分权重，仅 SnapGene） */
  similarity?: number
  /** 比对方向 */
  orientation?: 'Forward' | 'Reverse Complement'
  /** 质量评分（统一排序用，engine 计算） */
  qualityScore?: number
  /** 可信度等级 */
  confidence?: 'High' | 'Medium' | 'Low'
  /** 算法间是否存在冲突 */
  conflict?: boolean
}
