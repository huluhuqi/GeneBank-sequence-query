import { defineStore } from 'pinia'
import type { AlignmentResult } from '../types/alignment'

/** 方法筛选类型：'all' 或具体算法名 */
export type MethodFilter = 'all' | 'Sliding' | 'Local' | 'Reverse Complement' | 'SnapGene'

export const useResultStore = defineStore('result', {
  state: () => ({
    results: [] as AlignmentResult[],
    selectedResult: null as AlignmentResult | null,

    keyword: '',
    sortField: 'score' as keyof AlignmentResult,
    sortOrder: 'desc' as 'asc' | 'desc',
    showAdvanced: false,

    // 多算法筛选
    methodFilter: 'all' as MethodFilter,
    // 一致性阈值
    minIdentity: 0,
    // 最大错配数
    maxMismatch: -1, // -1 表示不限制
  }),

  getters: {
    availableMethods(state): string[] {
      const set = new Set<string>()
      state.results.forEach((r) => set.add(r.method))
      return Array.from(set)
    },

    filteredResults(state): AlignmentResult[] {
      let data = state.results

      // 关键词过滤
      const key = state.keyword.toLowerCase()
      if (key) {
        data = data.filter(
          (item) =>
            item.referenceName.toLowerCase().includes(key) ||
            item.queryName.toLowerCase().includes(key) ||
            (item.referenceId?.toLowerCase().includes(key) ?? false) ||
            (item.queryId?.toLowerCase().includes(key) ?? false),
        )
      }

      // 方法过滤
      if (state.methodFilter !== 'all') {
        data = data.filter((item) => item.method === state.methodFilter)
      }

      // 一致性阈值
      if (state.minIdentity > 0) {
        data = data.filter((item) => item.identity >= state.minIdentity)
      }

      // 错配阈值
      if (state.maxMismatch >= 0) {
        data = data.filter((item) => item.mismatch <= state.maxMismatch)
      }

      return data
    },

    sortedResults(): AlignmentResult[] {
      const data = [...this.filteredResults]
      const best = this.bestResult
      const field = this.sortField
      const order = this.sortOrder === 'desc' ? -1 : 1

      return data.sort((a, b) => {
        if (best) {
          if (a.id === best.id) return -1
          if (b.id === best.id) return 1
        }
        const va = a[field]
        const vb = b[field]
        if (typeof va === 'number' && typeof vb === 'number') {
          return (va - vb) * order
        }
        return String(va).localeCompare(String(vb)) * order
      })
    },

    bestResult(state): AlignmentResult | null {
      if (state.results.length === 0) return null
      return [...state.results].sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0))[0]
    },
  },

  actions: {
    setResults(data: AlignmentResult[]) {
      this.results = data
      this.selectedResult = null
    },

    /** 增量追加结果（流式更新，避免替换整个大数组） */
    appendResults(data: AlignmentResult[]) {
      if (data.length === 0) return
      this.results.push(...data)
    },

    selectResult(item: AlignmentResult) {
      this.selectedResult = item
    },

    setKeyword(val: string) {
      this.keyword = val
    },

    setMethodFilter(method: MethodFilter) {
      this.methodFilter = method
    },

    setMinIdentity(val: number) {
      this.minIdentity = val
    },

    setMaxMismatch(val: number) {
      this.maxMismatch = val
    },

    toggleSort(field: keyof AlignmentResult) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
      } else {
        this.sortField = field
        this.sortOrder = 'desc'
      }
    },

    toggleAdvanced() {
      this.showAdvanced = !this.showAdvanced
    },

    resetFilters() {
      this.keyword = ''
      this.methodFilter = 'all'
      this.minIdentity = 0
      this.maxMismatch = -1
    },

    clear() {
      this.results = []
      this.selectedResult = null
      this.keyword = ''
      this.methodFilter = 'all'
      this.minIdentity = 0
      this.maxMismatch = -1
    },
  },
})
