/**
 * 生成唯一序列 ID
 *
 * 格式：Reference-20260712-194512-001-x7k2
 * 组成：类型-日期-时间-序号-随机码
 *
 * 保证同一天多次导入、多序列无 header 时 ID 不冲突
 */
export function generateSequenceId(type: 'Reference' | 'Query', index: number): string {
  const now = new Date()

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')

  const time = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('')

  const random = Math.random().toString(36).substring(2, 6)

  return `${type}-${date}-${time}-${String(index).padStart(3, '0')}-${random}`
}
