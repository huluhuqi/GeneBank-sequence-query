/**
 * 环状 DNA（Circular DNA）支持
 *
 * 质粒 DNA 是环状结构，线性 DP 无法跨越 origin（0/末端边界）进行比对。
 *
 * 高效方案：将 reference 末尾追加 query 长度的头部，只运行一次 DP。
 * - 扩展后 reference 包含所有可能的环状起点
 * - DP 会自然找到最佳匹配位置
 * - 如果命中位置在扩展区域，说明跨越了 origin
 *
 * 复杂度：O((M+Q) × Q)，比遍历所有起点 O(N × M × Q) 快 N 倍
 */

/**
 * 扩展环状 reference：末尾追加 query 长度的头部
 *
 * 例如：
 *   reference = "AAAACCCC" (8bp)
 *   queryLength = 4
 *   extended  = "AAAACCCCAAAA" (12bp)
 *
 * 这样 DP 可以找到跨越 origin 的匹配：
 *   query = "CCCAAA" 可以在 extended 的位置 3-8 找到完整匹配
 *
 * @param originalReference 原始环状 reference 序列
 * @param queryLength Query 长度（决定追加多少头部）
 * @returns 扩展后的 reference 和原始长度
 */
export function extendCircularReference(
  originalReference: string,
  queryLength: number,
): {
  extendedReference: string
  originalLength: number
} {
  const originalLength = originalReference.length

  // 追加长度 = min(queryLength, originalLength)
  // 避免重复追加超过序列本身长度
  const appendLength = Math.min(queryLength, originalLength)

  const extendedReference =
    originalReference + originalReference.slice(0, appendLength)

  return { extendedReference, originalLength }
}

/**
 * 规范化环状坐标：将扩展后的坐标转换回原始环状坐标
 *
 * 例如：
 *   originalLength = 6000
 *   start = 5995, end = 6015
 *
 * 转换后：
 *   start = 5995, end = 15
 *   crossOrigin = true（end 越过了 origin）
 *
 * @param start 1-based 起始位置（基于扩展后的 reference）
 * @param end 1-based 结束位置（基于扩展后的 reference）
 * @param originalLength 原始 reference 长度
 * @returns 规范化后的坐标和是否跨越 origin 标志
 */
export function normalizeCircularPosition(
  start: number,
  end: number,
  originalLength: number,
): {
  start: number
  end: number
  crossOrigin: boolean
} {
  // 如果 end 超过原始长度，说明跨越了 origin
  const crossOrigin = end > originalLength

  // 使用模运算转换坐标（1-based）
  const normalizedStart = ((start - 1) % originalLength) + 1
  const normalizedEnd = ((end - 1) % originalLength) + 1

  return {
    start: normalizedStart,
    end: normalizedEnd,
    crossOrigin,
  }
}

/**
 * 判断环状模式是否值得尝试
 *
 * 只对短 Query（≤500bp）尝试环状模式：
 * - 短 Query 跨越 origin 的概率更高
 * - 扩展后的 DP 矩阵大小可控
 * - 长 Query 几乎不可能完全跨越 origin
 */
export function shouldTryCircular(queryLength: number): boolean {
  return queryLength <= 500
}
