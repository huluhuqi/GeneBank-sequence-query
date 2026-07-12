export interface AlignmentCoordinates {
  referenceStart: number
  referenceEnd: number
  queryStart: number
  queryEnd: number
}

/**
 * 根据 alignment 结果计算真实坐标
 *
 * 遍历 alignedReference 和 alignedQuery，统计：
 * - 首次出现有效匹配的位置（即两端去掉纯 gap 区域）
 * - 最后一次出现有效匹配的位置
 *
 * 坐标为 1-based。
 */
export function calculateCoordinates(
  alignedReference: string,
  alignedQuery: string,
): AlignmentCoordinates {
  let refPosition = 0
  let queryPosition = 0

  let refStart = 0
  let refEnd = 0
  let queryStart = 0
  let queryEnd = 0

  const len = alignedReference.length

  for (let i = 0; i < len; i++) {
    const refBase = alignedReference[i]
    const queryBase = alignedQuery[i]

    if (refBase !== '-') {
      refPosition++
    }

    if (queryBase !== '-') {
      queryPosition++
    }

    // 第一次出现有效 Query 碱基
    if (queryBase !== '-' && queryStart === 0) {
      queryStart = queryPosition
    }

    // 最后一次有效 Query 碱基（持续更新）
    if (queryBase !== '-') {
      queryEnd = queryPosition
    }

    // Reference 坐标：以双方都有碱基的位置为准
    if (refBase !== '-' && queryBase !== '-') {
      if (refStart === 0) {
        refStart = refPosition
      }
      refEnd = refPosition
    }
  }

  return {
    referenceStart: refStart,
    referenceEnd: refEnd,
    queryStart,
    queryEnd,
  }
}
