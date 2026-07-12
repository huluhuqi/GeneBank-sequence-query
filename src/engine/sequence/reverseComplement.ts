// 反向互补：支持完整 IUPAC 核酸编码
const complement: Record<string, string> = {
  A: 'T',
  T: 'A',
  C: 'G',
  G: 'C',
  U: 'A',

  // 简并碱基（IUPAC）
  R: 'Y',
  Y: 'R',
  S: 'S',
  W: 'W',
  K: 'M',
  M: 'K',
  B: 'V',
  V: 'B',
  D: 'H',
  H: 'D',
  N: 'N',
}

export function reverseComplement(seq: string): string {
  return seq
    .toUpperCase()
    .split('')
    .reverse()
    .map((base) => complement[base] ?? base)
    .join('')
}
