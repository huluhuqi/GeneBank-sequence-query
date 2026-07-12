import type { AlignmentResult } from '../types/alignment'
import { runAlignment } from '../engine/alignment/engine'
import type { AlignmentConfig } from '../engine/alignment/alignmentManager'

// Worker 消息类型
interface WorkerRequest {
  id: string
  reference: string
  query: string
  methods: string[] | AlignmentConfig
  referenceName?: string
  queryName?: string
}

interface WorkerCancel {
  type: 'cancel'
  id: string
}

/** 类型守卫：判断是否为取消消息 */
function isCancelMessage(data: WorkerRequest | WorkerCancel): data is WorkerCancel {
  return (data as WorkerCancel).type === 'cancel'
}

export interface WorkerDone {
  type: 'done'
  id: string
  results: AlignmentResult[]
}

export type WorkerResponse =
  | WorkerDone
  | { type: 'error'; id: string; error: string }
  | { type: 'warning'; id: string; message: string }

// 大数据保护阈值：单条序列超过此长度视为异常
const MAX_SEQUENCE_LENGTH = 1_000_000

self.onmessage = (e: MessageEvent<WorkerRequest | WorkerCancel>) => {
  const data = e.data

  // 取消任务
  if (isCancelMessage(data)) {
    self.close()
    return
  }

  const { id, reference, query, methods, referenceName, queryName } = data

  // 大数据保护
  if (reference.length > MAX_SEQUENCE_LENGTH || query.length > MAX_SEQUENCE_LENGTH) {
    const response: WorkerResponse = {
      type: 'warning',
      id,
      message: `序列过长（>${MAX_SEQUENCE_LENGTH}bp），已跳过`,
    }
    self.postMessage(response)
    return
  }

  try {
    const results = runAlignment(reference, query, methods)

    results.forEach((r) => {
      r.referenceName = referenceName || ''
      r.queryName = queryName || ''
    })

    const response: WorkerDone = {
      type: 'done',
      id,
      results,
    }

    self.postMessage(response)
  } catch (error) {
    // 错误时也返回，避免 Worker 挂起
    const response: WorkerResponse = {
      type: 'error',
      id,
      error: error instanceof Error ? error.message : String(error),
    }
    self.postMessage(response)
  }
}
