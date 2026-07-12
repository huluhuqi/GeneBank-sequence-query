import { defineStore } from 'pinia'

export interface HistoryRecord {
  id: string
  /** 任务名称 */
  name: string
  /** 完成时间 ISO 字符串 */
  time: string
  /** Reference 数量 */
  referenceCount: number
  /** Query 数量 */
  queryCount: number
  /** 使用的比对方法 */
  methods: string[]
  /** 结果数量 */
  resultCount: number
  /** 耗时（秒） */
  duration: number
}

const STORAGE_KEY = 'sat-analysis-history'
const MAX_RECORDS = 50

function loadHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function saveHistory(records: HistoryRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // 存储失败时静默
  }
}

export const useHistoryStore = defineStore('history', {
  state: () => ({
    records: loadHistory() as HistoryRecord[],
  }),

  actions: {
    add(record: Omit<HistoryRecord, 'id' | 'time'>) {
      const item: HistoryRecord = {
        ...record,
        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        time: new Date().toISOString(),
        name: record.name || `分析任务 ${this.records.length + 1}`,
      }
      this.records.unshift(item)
      // 限制最大数量
      if (this.records.length > MAX_RECORDS) {
        this.records = this.records.slice(0, MAX_RECORDS)
      }
      saveHistory(this.records)
    },

    remove(id: string) {
      this.records = this.records.filter((r) => r.id !== id)
      saveHistory(this.records)
    },

    clear() {
      this.records = []
      saveHistory(this.records)
    },
  },
})
