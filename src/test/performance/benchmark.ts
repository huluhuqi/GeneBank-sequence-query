// 性能测试与压测工具
// 基础工具：生成序列、计时、内存占用
import { AlignmentScheduler } from '../../engine/alignment/scheduler'
import type { SequenceItem } from '../../types/sequence'

const BASES = ['A', 'T', 'C', 'G']

/** 生成指定长度的随机 DNA 序列 */
export function generateSequence(length: number): string {
  let seq = ''
  for (let i = 0; i < length; i++) {
    seq += BASES[Math.floor(Math.random() * 4)]
  }
  return seq
}

/** 旧别名，保持向后兼容 */
export const createTestSequence = generateSequence

/** 生成批量测试对（保证 Query 源自 Reference 的某段，确保有匹配） */
export function createTestPairs(
  count: number,
  refLength: number,
  queryLength: number,
): { reference: string; query: string }[] {
  const pairs: { reference: string; query: string }[] = []
  for (let i = 0; i < count; i++) {
    const reference = generateSequence(refLength)
    const start = Math.floor(Math.random() * Math.max(1, refLength - queryLength))
    const query = reference.substring(start, start + queryLength)
    pairs.push({ reference, query })
  }
  return pairs
}

/** 通用 benchmark 计时函数 */
export async function benchmark(
  fn: () => void | Promise<void>,
  label = 'benchmark',
  onLog?: (message: string) => void,
): Promise<number> {
  const start = performance.now()
  await fn()
  const end = performance.now()
  const duration = end - start
  if (onLog) {
    onLog(`[${label}] ${duration.toFixed(2)} ms`)
  }
  return duration
}

/** 获取当前 JS 堆内存使用（MB），不支持时返回 0 */
export function getMemoryUsage(): number {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    // @ts-expect-error - memory 是非标准 API
    return performance.memory.usedJSHeapSize / 1024 / 1024
  }
  return 0
}

// ============ 压测场景定义 ============

export interface StressTestScenario {
  /** 场景名称 */
  name: string
  nameEn: string
  /** Reference 条数 */
  referenceCount: number
  /** Query 条数 */
  queryCount: number
  /** Reference 序列长度 */
  refLength: number
  /** Query 序列长度 */
  queryLength: number
}

export const STRESS_TEST_SCENARIOS: StressTestScenario[] = [
  {
    name: '小型',
    nameEn: 'Small',
    referenceCount: 100,
    queryCount: 100,
    refLength: 200,
    queryLength: 150,
  },
  {
    name: '中型',
    nameEn: 'Medium',
    referenceCount: 1000,
    queryCount: 1000,
    refLength: 200,
    queryLength: 150,
  },
  {
    name: '大型',
    nameEn: 'Large',
    referenceCount: 5000,
    queryCount: 5000,
    refLength: 200,
    queryLength: 150,
  },
]

// ============ 压测结果 ============

export interface PerformanceMetrics {
  /** 场景名称 */
  scenarioName: string
  /** 耗时（ms） */
  duration: number
  /** 内存占用（MB） */
  memory: number
  /** Worker 数量 */
  workerCount: number
  /** 结果数量 */
  resultCount: number
  /** Reference 条数 */
  referenceCount: number
  /** Query 条数 */
  queryCount: number
  /** 完成时间戳 */
  timestamp: number
}

export interface StressTestProgress {
  scenarioName: string
  current: number
  total: number
  phase: 'generating' | 'running' | 'done'
}

export interface StressTestOptions {
  scenario: StressTestScenario
  methods?: string[]
  onProgress?: (progress: StressTestProgress) => void
}

/**
 * 运行单个压测场景
 * 动态导入 scheduler 以避免在未使用时加载 Worker
 */
export async function runStressTest(options: StressTestOptions): Promise<PerformanceMetrics> {
  const { scenario, methods = ['Sliding'], onProgress } = options
  const memBefore = getMemoryUsage()
  const workerCount = Math.max(1, (navigator.hardwareConcurrency || 2) - 1)

  onProgress?.({
    scenarioName: scenario.name,
    current: 0,
    total: scenario.referenceCount,
    phase: 'generating',
  })

  // 生成测试序列对
  const pairs = createTestPairs(
    scenario.referenceCount,
    scenario.refLength,
    scenario.queryLength,
  )

  const references: SequenceItem[] = pairs.map((p, i) => ({
    id: `REF-${i + 1}`,
    sequence: p.reference,
    originalSequence: p.reference,
    name: `REF-${i + 1}`,
    source: 'manual',
    index: i,
    createdAt: new Date().toISOString(),
    length: p.reference.length,
    type: 'DNA',
    gc: 0,
    operations: [],
  }))

  const queries: SequenceItem[] = pairs.map((p, i) => ({
    id: `QRY-${i + 1}`,
    sequence: p.query,
    originalSequence: p.query,
    name: `QRY-${i + 1}`,
    source: 'manual',
    index: i,
    createdAt: new Date().toISOString(),
    length: p.query.length,
    type: 'DNA',
    gc: 0,
    operations: [],
  }))

  let resultCount = 0
  const startTime = performance.now()

  onProgress?.({
    scenarioName: scenario.name,
    current: 0,
    total: scenario.referenceCount,
    phase: 'running',
  })

  const scheduler = new AlignmentScheduler({
    methods,
    onProgress: (p) => {
      onProgress?.({
        scenarioName: scenario.name,
        current: p.current,
        total: p.total,
        phase: 'running',
      })
    },
  })

  const results = await scheduler.start(references, queries)
  resultCount = results.length
  scheduler.cancel()

  const duration = performance.now() - startTime
  const memAfter = getMemoryUsage()
  const memory = memAfter > 0 ? Math.max(0, memAfter - memBefore) : 0

  onProgress?.({
    scenarioName: scenario.name,
    current: scenario.referenceCount,
    total: scenario.referenceCount,
    phase: 'done',
  })

  return {
    scenarioName: scenario.name,
    duration,
    memory,
    workerCount,
    resultCount,
    referenceCount: scenario.referenceCount,
    queryCount: scenario.queryCount,
    timestamp: Date.now(),
  }
}

/**
 * 批量运行所有压测场景
 */
export async function runAllStressTests(
  methods?: string[],
  onProgress?: (progress: StressTestProgress) => void,
  onComplete?: (metrics: PerformanceMetrics) => void,
): Promise<PerformanceMetrics[]> {
  const allMetrics: PerformanceMetrics[] = []
  for (const scenario of STRESS_TEST_SCENARIOS) {
    const metrics = await runStressTest({ scenario, methods, onProgress })
    allMetrics.push(metrics)
    onComplete?.(metrics)
  }
  return allMetrics
}
