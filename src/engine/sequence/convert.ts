// DNA → RNA
export function dnaToRna(seq: string): string {
  return seq.toUpperCase().replace(/T/g, 'U')
}

// RNA → DNA
export function rnaToDna(seq: string): string {
  return seq.toUpperCase().replace(/U/g, 'T')
}
