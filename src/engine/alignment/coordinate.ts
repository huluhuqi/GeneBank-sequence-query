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
 * 坐标为 1-based（与 SnapGene / BLAST 显示一致）。
 *
 * 注意：不能用 `refStart === 0` 判断"未设置"，
 * 因为第一个碱基在位置 1 时 refPosition 会先 ++ 再赋值，
 * 但若首字符就是有效匹配，refStart 应为 1 而非 0。
 * 这里使用 `refStartFound` 布尔标志避免该 bug。
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

  // 使用标志位而非 `=== 0` 判断，避免首个有效位置为 0 时被重复覆盖
  let refStartFound = false
  let queryStartFound = false

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
    if (queryBase !== '-' && !queryStartFound) {
      queryStart = queryPosition
      queryStartFound = true
    }

    // 最后一次有效 Query 碱基（持续更新）
    if (queryBase !== '-') {
      queryEnd = queryPosition
    }

    // Reference 坐标：以双方都有碱基的位置为准（有效匹配）
    if (refBase !== '-' && queryBase !== '-') {
      if (!refStartFound) {
        refStart = refPosition
        refStartFound = true
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
