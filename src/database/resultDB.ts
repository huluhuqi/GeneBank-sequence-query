import type { AlignmentResult } from '../types/alignment'

const DB_NAME = 'sat-alignment-db'
const DB_VERSION = 1
const STORE_NAME = 'results'

export interface SavedTask {
  id: string
  time: string
  parameters: {
    referenceCount: number
    queryCount: number
    methods: string[]
  }
  results: AlignmentResult[]
}

let dbInstance: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/** 保存任务结果到 IndexedDB */
export async function saveTask(task: SavedTask): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(task)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/** 读取单个任务结果 */
export async function loadTask(id: string): Promise<SavedTask | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

/** 列出所有已保存任务（仅元信息，不含结果数据） */
export async function listTasks(): Promise<Omit<SavedTask, 'results'>[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => {
      const tasks = (request.result || []) as SavedTask[]
      resolve(tasks.map(({ results, ...meta }) => meta))
    }
    request.onerror = () => reject(request.error)
  })
}

/** 删除任务 */
export async function deleteTask(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/** 清空所有任务 */
export async function clearAllTasks(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
