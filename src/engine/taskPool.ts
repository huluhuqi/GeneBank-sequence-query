/**
 * 并发任务池
 *
 * 控制异步任务的并发数量，避免一次性创建大量 Promise 导致内存溢出。
 *
 * @param tasks 任务函数数组
 * @param limit 最大并发数，默认 4
 */
export async function runPool<T>(
  tasks: (() => Promise<T>)[],
  limit = 4,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let index = 0

  async function worker() {
    while (index < tasks.length) {
      const current = index++
      results[current] = await tasks[current]()
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker())
  await Promise.all(workers)

  return results
}
