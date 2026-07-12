// 生成带时间戳的文件名
export function createFileName(prefix = 'SequenceAlignment', ext: string): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`
  return `${prefix}_${ts}.${ext}`
}

// 通用下载函数
export function downloadText(text: string, fileName: string, mimeType = 'text/plain;charset=utf-8;') {
  const blob = new Blob([text], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
