export interface AlignmentConfig {
  /** 是否自动选择算法，默认 true */
  autoSelect?: boolean
  /** 手动选择的算法列表（autoSelect=false 时使用） */
  methods?: string[]
}

/**
 * 智能算法选择
 *
 * 根据序列长度自动选择最合适的算法组合：
 * - 短序列 (≤100bp): Sliding + Local
 * - 中序列 (101~1000bp): Local + SnapGene
 * - 长序列 (>1000bp): SnapGene
 *
 * 反向互补检测始终启用。
 */
export function selectMethods(
  reference: string,
  query: string,
  config: AlignmentConfig = {},
): string[] {
  void reference // 保留参数以匹配 API 签名，当前仅依据 query 长度选择
  if (config.autoSelect === false) {
    return config.methods ?? []
  }

  const methods: string[] = []
  const queryLength = query.length

  if (queryLength <= 100) {
    // 短序列：滑动 + 局部
    methods.push('Sliding')
    methods.push('Local')
  } else if (queryLength <= 1000) {
    // 中等序列：局部 + 全局
    methods.push('Local')
    methods.push('SnapGene')
  } else {
    // 长序列：全局为主
    methods.push('SnapGene')
  }

  // 反向互补永远检查
  if (!methods.includes('Reverse Complement')) {
    methods.push('Reverse Complement')
  }

  return methods
}
