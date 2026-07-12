import type { AlignmentResult } from '../types/alignment'

/**
 * 比对引擎统一接口
 * 未来可通过实现 WasmEngine 替换 JsEngine，实现 WASM 加速
 */
export interface AlignmentEngine {
  /** 引擎名称 */
  readonly name: string

  /** 引擎版本 */
  readonly version: string

  /**
   * 执行单次比对
   * @param reference 参考序列
   * @param query 查询序列
   * @param methods 比对方法列表
   * @returns 比对结果数组
   */
  run(reference: string, query: string, methods: string[]): AlignmentResult[]

  /** 初始化引擎（WASM 加载等） */
  init?(): Promise<void>

  /** 释放引擎资源 */
  dispose?(): void
}

/**
 * 当前使用的引擎实例
 * 默认为 JS 引擎，未来可切换为 WASM 引擎
 */
let currentEngine: AlignmentEngine | null = null

/**
 * 注册比对引擎
 */
export function setAlignmentEngine(engine: AlignmentEngine) {
  currentEngine = engine
}

/**
 * 获取当前引擎
 */
export function getAlignmentEngine(): AlignmentEngine | null {
  return currentEngine
}
