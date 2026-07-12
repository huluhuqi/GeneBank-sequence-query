// Web Worker Pool：多 Worker 并行任务调度
export interface WorkerTask<T = unknown, R = unknown> {
  id: string
  data: T
  resolve: (value: R) => void
  reject: (reason: unknown) => void
}

export class WorkerPool {
  private pool: Worker[] = []
  private queue: WorkerTask[] = []
  private busyWorkers = new Set<Worker>()
  /** Worker → 当前任务的映射，避免在 Worker 实例上挂载属性 */
  private workerTasks = new WeakMap<Worker, WorkerTask>()
  private workerUrl: URL
  private maxWorkers: number
  private running = false

  constructor(workerUrl: URL, maxWorkers?: number) {
    this.workerUrl = workerUrl
    // 限制最大 Worker 数为 8，避免高核 CPU 创建过多 Worker 导致：
    // 1. 内存占用过高
    // 2. 浏览器线程调度压力增加
    // 3. Worker 创建成本累积
    const cpuCount = navigator.hardwareConcurrency || 4
    this.maxWorkers = maxWorkers ?? Math.min(8, Math.max(1, cpuCount - 1))
  }

  /** 统一 Worker 创建函数，确保 onmessage/onerror 一致绑定 */
  private createWorker(): Worker {
    const worker = new Worker(this.workerUrl, { type: 'module' })
    worker.onmessage = (e) => this.handleMessage(worker, e.data)
    worker.onerror = (e) => this.handleError(worker, e)
    return worker
  }

  start() {
    this.running = true
    for (let i = 0; i < this.maxWorkers; i++) {
      this.pool.push(this.createWorker())
    }
  }

  submit<T, R>(data: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const task: WorkerTask = {
        id: crypto.randomUUID(),
        data,
        resolve: resolve as (value: unknown) => void,
        reject,
      }

      const freeWorker = this.pool.find((w) => !this.busyWorkers.has(w))
      if (freeWorker) {
        this.runTask(freeWorker, task)
      } else {
        this.queue.push(task)
      }
    })
  }

  private runTask(worker: Worker, task: WorkerTask) {
    this.busyWorkers.add(worker)
    this.workerTasks.set(worker, task)
    const data = task.data && typeof task.data === 'object' ? task.data : {}
    worker.postMessage({
      id: task.id,
      ...data,
    })
  }

  private handleMessage(worker: Worker, message: unknown) {
    const task = this.workerTasks.get(worker)
    if (task) {
      this.busyWorkers.delete(worker)
      this.workerTasks.delete(worker)
      task.resolve(message)
    }
    // 从队列中取下一个任务
    const nextTask = this.queue.shift()
    if (nextTask) {
      this.runTask(worker, nextTask)
    }
  }

  private handleError(worker: Worker, error: ErrorEvent) {
    const task = this.workerTasks.get(worker)
    if (task) {
      this.busyWorkers.delete(worker)
      this.workerTasks.delete(worker)
      task.reject(error.error ?? new Error(error.message))
    }

    // 终止异常 Worker 并从池中移除
    worker.terminate()
    this.pool = this.pool.filter((w) => w !== worker)

    // 自动补充新 Worker，保持池容量
    if (this.running) {
      const newWorker = this.createWorker()
      this.pool.push(newWorker)

      // 处理队列中可能积压的任务
      const nextTask = this.queue.shift()
      if (nextTask) {
        this.runTask(newWorker, nextTask)
      }
    }
  }

  // 暂停所有任务（清空队列）
  pause() {
    this.queue = []
  }

  // 停止并销毁所有 Worker
  terminate() {
    this.running = false
    this.pool.forEach((w) => w.terminate())
    this.pool = []
    this.queue = []
    this.busyWorkers.clear()
    this.workerTasks = new WeakMap()
  }

  // 获取状态
  get status() {
    return {
      totalWorkers: this.pool.length,
      busyWorkers: this.busyWorkers.size,
      queueLength: this.queue.length,
    }
  }
}
