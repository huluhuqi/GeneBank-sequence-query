/** Query 最小长度阈值，低于此值产生大量随机命中（25%/4bp ≈ 0.4%） */
export const MIN_QUERY_LENGTH = 4

/** Query 最大长度阈值（bp），超过此值跳过 DP 算法 */
export const MAX_QUERY_LENGTH = 1_000_000
