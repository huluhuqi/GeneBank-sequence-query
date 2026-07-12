// 大文件分块读取器
export interface ChunkReaderOptions {
  chunkSize?: number
  onProgress?: (loaded: number, total: number) => void
}

export async function* readChunk(
  file: File,
  options: ChunkReaderOptions = {},
): AsyncGenerator<string, void, unknown> {
  const chunkSize = options.chunkSize ?? 1024 * 1024 // 默认 1MB
  let offset = 0

  while (offset < file.size) {
    const end = Math.min(offset + chunkSize, file.size)
    const chunk = file.slice(offset, end)
    const text = await chunk.text()

    if (options.onProgress) {
      options.onProgress(end, file.size)
    }

    yield text

    offset = end
  }
}

// 按行读取（处理跨块的行）
export async function readLines(
  file: File,
  options: ChunkReaderOptions = {},
): Promise<string[]> {
  const lines: string[] = []
  let buffer = ''

  for await (const chunk of readChunk(file, options)) {
    buffer += chunk
    const splitIdx = buffer.lastIndexOf('\n')
    if (splitIdx !== -1) {
      const completeLines = buffer.substring(0, splitIdx).split(/\r?\n/)
      lines.push(...completeLines)
      buffer = buffer.substring(splitIdx + 1)
    }
  }

  // 最后一行
  if (buffer.trim()) {
    lines.push(buffer.replace(/\r/g, ''))
  }

  return lines
}
