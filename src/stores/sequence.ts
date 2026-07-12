import { defineStore } from 'pinia'
import type { SequenceItem } from '../types/sequence'
import { calcGC, detectType } from '../engine/sequence/statistics'

export const useSequenceStore = defineStore('sequence', {
  state: () => ({
    reference: [] as SequenceItem[],
    query: [] as SequenceItem[],

    selectedRefIds: [] as string[],
    selectedQueryIds: [] as string[],
  }),

  actions: {
    setReference(items: SequenceItem[]) {
      this.reference = items
    },

    setQuery(items: SequenceItem[]) {
      this.query = items
    },

    addReference(items: SequenceItem[]) {
      this.reference.push(...items)
    },

    addQuery(items: SequenceItem[]) {
      this.query.push(...items)
    },

    removeReference(id: string) {
      this.reference = this.reference.filter((item) => item.id !== id)
      this.selectedRefIds = this.selectedRefIds.filter((sid) => sid !== id)
    },

    removeQuery(id: string) {
      this.query = this.query.filter((item) => item.id !== id)
      this.selectedQueryIds = this.selectedQueryIds.filter((sid) => sid !== id)
    },

    reorderReference(newList: SequenceItem[]) {
      this.reference = newList
    },

    reorderQuery(newList: SequenceItem[]) {
      this.query = newList
    },

    // 批量选择：切换某条 Reference 的选中状态
    toggleSelectReference(id: string) {
      const idx = this.selectedRefIds.indexOf(id)
      if (idx > -1) this.selectedRefIds.splice(idx, 1)
      else this.selectedRefIds.push(id)
    },

    toggleSelectQuery(id: string) {
      const idx = this.selectedQueryIds.indexOf(id)
      if (idx > -1) this.selectedQueryIds.splice(idx, 1)
      else this.selectedQueryIds.push(id)
    },

    // 全选 / 取消全选
    selectAllReference(ids: string[]) {
      this.selectedRefIds =
        this.selectedRefIds.length === ids.length ? [] : [...ids]
    },

    selectAllQuery(ids: string[]) {
      this.selectedQueryIds =
        this.selectedQueryIds.length === ids.length ? [] : [...ids]
    },

    clearSelectionReference() {
      this.selectedRefIds = []
    },

    clearSelectionQuery() {
      this.selectedQueryIds = []
    },

    // 批量删除选中
    removeSelectedReference() {
      this.reference = this.reference.filter(
        (item) => !this.selectedRefIds.includes(item.id),
      )
      this.selectedRefIds = []
    },

    removeSelectedQuery() {
      this.query = this.query.filter(
        (item) => !this.selectedQueryIds.includes(item.id),
      )
      this.selectedQueryIds = []
    },

    // 批量重命名：按顺序重新编号
    batchRenameReference(prefix: string, start: number, pad: number) {
      this.reference.forEach((item, idx) => {
        item.id = `${prefix}_${String(start + idx).padStart(pad, '0')}`
        item.name = item.id
      })
    },

    batchRenameQuery(prefix: string, start: number, pad: number) {
      this.query.forEach((item, idx) => {
        item.id = `${prefix}_${String(start + idx).padStart(pad, '0')}`
        item.name = item.id
      })
    },

    updateReference(id: string, seq: string) {
      const item = this.reference.find((x) => x.id === id)
      if (item) {
        item.sequence = seq
        item.length = seq.length
        item.gc = calcGC(seq)
        item.type = detectType(seq)
      }
    },

    updateQuery(id: string, seq: string) {
      const item = this.query.find((x) => x.id === id)
      if (item) {
        item.sequence = seq
        item.length = seq.length
        item.gc = calcGC(seq)
        item.type = detectType(seq)
      }
    },

    restoreReference() {
      this.reference.forEach((item) => {
        item.sequence = item.originalSequence
        item.operations = []
        item.length = item.sequence.length
        item.gc = calcGC(item.sequence)
        item.type = detectType(item.sequence)
      })
    },

    restoreQuery() {
      this.query.forEach((item) => {
        item.sequence = item.originalSequence
        item.operations = []
        item.length = item.sequence.length
        item.gc = calcGC(item.sequence)
        item.type = detectType(item.sequence)
      })
    },

    clear() {
      this.reference = []
      this.query = []
    },

    clearReference() {
      this.reference = []
    },

    clearQuery() {
      this.query = []
    },
  },
})
