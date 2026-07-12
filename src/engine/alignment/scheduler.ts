import type { SequenceItem } from '../../types/sequence'
import type { AlignmentResult } from '../../types/alignment'
import { WorkerPool } from '../../utils/workerPool'
import { clearCache as clearSnapgeneCache } from './cache'
import type { AlignmentConfig } from './alignmentManager'
import type { WorkerResponse, WorkerDone } from '../../workers/alignment.worker'
import workerUrl from '../../workers/alignment.worker.ts?worker&url'

export interface SchedulerProgress {
  current: number
  total: number
  newResults: AlignmentResult[]
  errors: number
  successCount: number
}

export interface SchedulerOptions {
  methods: string[] | AlignmentConfig
  /** 每次进度更新时触发，传递累积结果和增量结果 */
  onProgress?: (progress: SchedulerProgress) => void
  /** 每批结果产生时触发（仅传递新增结果，用于流式 UI 更新） */
  onResult?: (newResults: AlignmentResult[]) => void
  onComplete?: (results: AlignmentResult[]) => void
  useWorker?: boolean
}

// 高级调度器：支持 Worker 池、暂停、取消、错误恢复
export class AlignmentScheduler {
  private references: SequenceItem[] = []
  private queries: SequenceItem[] = []
  private methods: string[] | AlignmentConfig = []
  private workerPool: WorkerPool | null = null
  private results: AlignmentResult[] = []
  private successCount = 0
  private errorCount = 0
  private currentIndex = 0
  private total = 0
  private running = false
  private paused = false
  /** 是否被用户取消（取消时不触发 onComplete，避免显示"完成"消息） */
  private cancelled = false
  private onProgress?: (progress: SchedulerProgress) => void
  private onResult?: (newResults: AlignmentResult[]) => void
  private onComplete?: (results: AlignmentResult[]) => void
  /** 上次报告时的结果数量，用于计算增量 */
  private lastReportedCount = 0
  /** 结果缓冲区，避免大批量任务频繁刷新 UI */
  private resultBuffer: AlignmentResult[] = []
  /** 缓冲刷新定时器 */
  private flushTimer: ReturnType<typeof setTimeout> | null = null
  /** 缓冲刷新间隔（ms） */
  private readonly FLUSH_INTERVAL = 100

  constructor(options: SchedulerOptions) {
    this.methods = options.methods
    this.onProgress = options.onProgress
    this.onResult = options.onResult
    this.onComplete = options.onComplete
  }

  async start(references: SequenceItem[], queries: SequenceItem[]): Promise<AlignmentResult[]> {
    clearSnapgeneCache()

    this.references = references
    this.queries = queries
    this.total = Math.min(references.length, queries.length)
    this.results = []
    this.successCount = 0
    this.errorCount = 0
    this.currentIndex = 0
    this.lastReportedCount = 0
    this.resultBuffer = []
    this.running = true
    this.paused = false
    this.cancelled = false

    // 启动缓冲刷新定时器
    this.startFlushTimer()

    const useWorker = typeof Worker !== 'undefined'
    try {
      if (useWorker) {
        this.workerPool = new WorkerPool(new URL(workerUrl, import.meta.url))
        this.workerPool.start()
        await this.runWithWorkerPool()
      } else {
        await this.runInMainThread()
      }
    } catch (error) {
      console.error('[Scheduler] 任务执行异常', error)
      throw error
    } finally {
      this.running = false
      this.workerPool?.terminate()
      this.workerPool = null
      // 最后一次刷新缓冲
      this.flushResults()
      this.stopFlushTimer()
    }

    // 仅在未取消时触发 onComplete，避免取消后误显示"完成"
    if (!this.cancelled) {
      this.onComplete?.(this.results)
    }
    return this.results
  }

  private async runWithWorkerPool() {
    if (!this.workerPool) return

    const tasks: Promise<void>[] = []
    const poolSize = this.workerPool.status.totalWorkers

    // 初始填充 Worker（并发启动 poolSize 个任务）
    for (let i = 0; i < Math.min(poolSize, this.total); i++) {
      tasks.push(this.submitTasks())
    }

    await Promise.all(tasks)
  }

  /**
   * 循环提交任务（替代递归，避免深递归维护困难）
   *
   * 每个 Promise 独立循环消费任务队列，多个 Promise 并发执行
   */
  private async submitTasks(): Promise<void> {
    while (this.currentIndex < this.total && this.running) {
      if (this.paused) {
        await this.waitForResume()
        if (!this.running) break
      }

      const index = this.currentIndex++
      if (index >= this.total) break

      try {
        const ref = this.references[index]
        const qry = this.queries[index]

        const result: WorkerResponse = await this.workerPool!.submit({
          reference: ref.sequence,
          query: qry.sequence,
          methods: this.methods,
          referenceName: ref.name,
          queryName: qry.name,
        })

        if (result.type === 'done') {
          const done = result as WorkerDone
          done.results.forEach((r) => {
            r.referenceId = ref.id
            r.queryId = qry.id
            r.referenceSequence = ref.sequence
            r.querySequence = qry.sequence
          })
          this.results.push(...done.results)
          this.resultBuffer.push(...done.results)
          this.successCount++
        } else if (result.type === 'error') {
          this.errorCount++
        }
      } catch {
        this.errorCount++
      }

      this.reportProgress()
    }
  }

  private async runInMainThread() {
    const { runAlignment } = await import('./engine')

    for (let i = 0; i < this.total; i++) {
      if (!this.running) break
      if (this.paused) {
        await this.waitForResume()
      }

      try {
        const ref = this.references[i]
        const qry = this.queries[i]
        const results = runAlignment(ref.sequence, qry.sequence, this.methods)
        results.forEach((r) => {
          r.referenceName = ref.name
          r.queryName = qry.name
          r.referenceId = ref.id
          r.queryId = qry.id
          r.referenceSequence = ref.sequence
          r.querySequence = qry.sequence
        })
        this.results.push(...results)
        this.resultBuffer.push(...results)
        this.successCount++
      } catch {
        this.errorCount++
      }

      this.currentIndex = i + 1
      this.reportProgress()

      // 释放 UI 线程
      await new Promise((r) => setTimeout(r, 0))
    }
  }

  private waitForResume(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (!this.paused || !this.running) {
          resolve()
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  }

  /** 启动定时刷新缓冲区 */
  private startFlushTimer() {
    if (this.flushTimer) return
    this.flushTimer = setInterval(() => {
      this.flushResults()
    }, this.FLUSH_INTERVAL)
  }

  /** 停止定时刷新 */
  private stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }

  /** 将缓冲区中的结果一次性推送给 UI，避免单条结果频繁刷新 */
  private flushResults() {
    if (this.resultBuffer.length === 0) return
    this.onResult?.(this.resultBuffer)
    this.resultBuffer = []
  }

  private reportProgress() {
    // 计算本次新增的结果（增量推送，用于 onProgress 回调）
    const newResults = this.results.slice(this.lastReportedCount)
    this.lastReportedCount = this.results.length

    this.onProgress?.({
      current: this.currentIndex,
      total: this.total,
      newResults,
      errors: this.errorCount,
      successCount: this.successCount,
    })
  }

  // 暂停
  pause() {
    this.paused = true
    this.workerPool?.pause()
  }

  // 恢复
  resume() {
    this.paused = false
  }

  // 取消
  cancel() {
    this.cancelled = true
    this.running = false
    this.paused = false
    this.workerPool?.terminate()
    this.workerPool = null
  }

  // 状态
  getStatus() {
    return {
      running: this.running,
      paused: this.paused,
      current: this.currentIndex,
      total: this.total,
      successCount: this.successCount,
      errorCount: this.errorCount,
      resultsCount: this.results.length,
    }
  }
}
