export interface SequenceItem {
  id: string
  name: string

  // 原始导入序列
  originalSequence: string

  // 当前分析序列
  sequence: string

  length: number

  type: "DNA" | "RNA" | "UNKNOWN"

  gc: number

  source: "file" | "paste" | "manual"

  fileName?: string

  // 当前排序编号
  index: number

  // 创建时间
  createdAt: string

  // 操作历史记录
  operations: string[]
}

export interface ImportResult {
  success: boolean
  items: SequenceItem[]
  errors: string[]
}
