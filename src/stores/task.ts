import { defineStore } from 'pinia'

export interface TaskState {
  total: number
  finished: number
  successCount: number
  errorCount: number
  progress: number
  running: boolean
  paused: boolean
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    total: 0,
    finished: 0,
    successCount: 0,
    errorCount: 0,
    progress: 0,
    running: false,
    paused: false,
  }),

  actions: {
    start(total: number) {
      this.total = total
      this.finished = 0
      this.successCount = 0
      this.errorCount = 0
      this.progress = 0
      this.running = true
      this.paused = false
    },

    update(current: number, total: number, successCount: number, errors: number) {
      this.finished = current
      this.total = total
      this.successCount = successCount
      this.errorCount = errors
      this.progress = total > 0 ? (current / total) * 100 : 0
    },

    complete() {
      this.running = false
      this.paused = false
      this.progress = 100
    },

    pause() {
      this.paused = true
    },

    resume() {
      this.paused = false
    },

    cancel() {
      this.running = false
      this.paused = false
    },

    reset() {
      this.total = 0
      this.finished = 0
      this.successCount = 0
      this.errorCount = 0
      this.progress = 0
      this.running = false
      this.paused = false
    },
  },
})
