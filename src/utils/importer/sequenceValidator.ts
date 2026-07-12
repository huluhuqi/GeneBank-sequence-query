/**
 * 序列合法字符校验与标准化
 *
 * 支持 IUPAC 核酸编码：
 *   A C G T U R Y N W S K M B D H V
 * 大小写不敏感，统一转大写
 */

/** IUPAC 核酸编码正则 */
const VALID_DNA = /^[ACGTURYNWSKMBDHV]+$/i

/**
 * 标准化序列：去除空白、换行，转大写
 */
export function normalizeSequence(seq: string): string {
  return seq.replace(/\s+/g, '').toUpperCase()
}

/**
 * 校验序列是否只含合法 IUPAC 核酸字符
 */
export function validateSequence(seq: string): boolean {
  const normalized = normalizeSequence(seq)
  return normalized.length > 0 && VALID_DNA.test(normalized)
}

/**
 * 过滤序列中的非法字符（保留合法字符）
 * 用于宽松模式：不报错，只清理
 */
export function sanitizeSequence(seq: string): string {
  return seq
    .toUpperCase()
    .replace(/[^ACGTURYNWSKMBDHV]/g, '')
}

/**
 * 检测非法字符并返回位置列表
 */
export function findInvalidChars(seq: string): Array<{ position: number; char: string }> {
  const invalid: Array<{ position: number; char: string }> = []
  const upper = seq.toUpperCase()
  for (let i = 0; i < upper.length; i++) {
    if (!/[ACGTURYNWSKMBDHV]/.test(upper[i]) && !/\s/.test(upper[i])) {
      invalid.push({ position: i + 1, char: seq[i] })
    }
  }
  return invalid
}
