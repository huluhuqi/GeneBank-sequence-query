<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NButton } from 'naive-ui'
import { Eraser, RotateCcw } from 'lucide-vue-next'
import SequenceDropZone from './SequenceDropZone.vue'
import SequenceList from './SequenceList.vue'
import SequenceToolbar from './SequenceToolbar.vue'
import BatchRenameDialog from './BatchRenameDialog.vue'
import PasteDialog from './PasteDialog.vue'
import ResponsiveGrid from '../layout/ResponsiveGrid.vue'
import ProcessGuide from '../common/ProcessGuide.vue'
import { useSequenceStore } from '../../stores/sequence'
import { useResultStore } from '../../stores/result'
import { useTaskStore } from '../../stores/task'
import { readFileText } from '../../utils/fileReader'
import { parseFasta, parseTextSequence, parseExcelPaste, isMultiColumnTSV, removeDuplicateIds, validateItems, assertNonEmpty } from '../../utils/importer'
import type { SequenceItem } from '../../types/sequence'
import { useI18n } from '../../i18n'
import { useMessage } from 'naive-ui'

const { t } = useI18n()
const message = useMessage()
const store = useSequenceStore()
const resultStore = useResultStore()
const taskStore = useTaskStore()

const showPasteRef = ref(false)
const showPasteQuery = ref(false)
const showRenameRef = ref(false)
const showRenameQuery = ref(false)

// 搜索关键词
const searchRef = ref('')
const searchQuery = ref('')

// Ctrl+V 直接输入：当前激活的目标区域
const activeTarget = ref<'reference' | 'query'>('reference')

/** 将 target 转换为导入器所需的类型标识 */
function targetType(target: 'reference' | 'query'): 'Reference' | 'Query' {
  return target === 'reference' ? 'Reference' : 'Query'
}

/**
 * 根据文本内容自动选择合适的导入器
 *
 * 检测优先级（Step 5 修复）：
 * 1. FASTA：含 > 开头的行
 * 2. Excel 双列：TSV 解析后存在多列行（不只是简单含 Tab）
 * 3. 纯文本：每行一条序列
 */
function importText(text: string, target: 'reference' | 'query', fileName?: string): SequenceItem[] {
  const type = targetType(target)

  // FASTA 格式：含 > 开头的行（优先检测，避免 Excel 含 > 字符误判）
  if (/^>/m.test(text)) {
    return parseFasta(text, type, fileName)
  }
  // Excel 双列格式：TSV 解析后存在多列行
  if (isMultiColumnTSV(text)) {
    return parseExcelPaste(text, type)
  }
  // 纯文本：每行一条序列
  return parseTextSequence(text, type, fileName)
}

async function handleFiles(target: 'reference' | 'query', files: File[]) {
  const allowTypes = ['fasta', 'fa', 'fna', 'fas', 'txt', 'csv', 'tsv', 'xlsx']

  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !allowTypes.includes(ext)) {
      message.warning(`${file.name} 不支持的文件类型`)
      continue
    }

    try {
      const text = await readFileText(file)
      assertNonEmpty(text)
      const items = validateItems(removeDuplicateIds(importText(text, target, file.name)))
      if (items.length > 0) {
        if (target === 'reference') {
          store.addReference(items)
        } else {
          store.addQuery(items)
        }
      } else {
        message.warning(`${file.name} 未检测到有效序列`)
      }
    } catch (error) {
      console.error('序列导入失败', error)
      message.error(
        '序列导入失败：' + (error instanceof Error ? error.message : '未知错误')
      )
    }
  }
}

function handleReferenceFiles(files: File[]) {
  handleFiles('reference', files)
}

function handleQueryFiles(files: File[]) {
  handleFiles('query', files)
}

function handlePaste(target: 'reference' | 'query', text: string) {
  try {
    const items = validateItems(removeDuplicateIds(importText(text, target)))
    if (items.length === 0) {
      message.warning('粘贴内容未检测到有效序列')
      return
    }
    if (target === 'reference') {
      store.addReference(items)
    } else {
      store.addQuery(items)
    }
  } catch (error) {
    console.error('序列粘贴失败', error)
    message.error(
      '序列粘贴失败：' + (error instanceof Error ? error.message : '未知错误')
    )
  }
}

// 全局 Ctrl+V 粘贴：根据 activeTarget 路由到对应区域
function handleWindowPaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text/plain')
  if (!text) return

  // 当 PasteDialog 打开时，让对话框自行处理粘贴
  if (showPasteRef.value || showPasteQuery.value) return

  // 防止浏览器默认粘贴行为
  event.preventDefault()
  handlePaste(activeTarget.value, text)
}

onMounted(() => {
  window.addEventListener('paste', handleWindowPaste)
})

onUnmounted(() => {
  window.removeEventListener('paste', handleWindowPaste)
})

const refCount = computed(() => store.reference.length)
const queryCount = computed(() => store.query.length)
const isReady = computed(() => refCount.value > 0 && queryCount.value > 0 && refCount.value === queryCount.value)
const isMismatch = computed(() => refCount.value !== queryCount.value && (refCount.value > 0 || queryCount.value > 0))
const statusText = computed(() => {
  if (refCount.value === 0 && queryCount.value === 0) return t.input.statusWaiting
  if (isReady.value) return t.input.statusReady
  if (isMismatch.value) return t.input.statusMismatch
  return t.input.statusReady
})
const statusClass = computed(() => {
  if (isReady.value) return 'status-ready'
  if (isMismatch.value) return 'status-error'
  return 'status-idle'
})

// 批量选择相关
const refSelectedCount = computed(() => store.selectedRefIds.length)
const querySelectedCount = computed(() => store.selectedQueryIds.length)

function toggleSelectRef(id: string) {
  store.toggleSelectReference(id)
}

function toggleSelectQuery(id: string) {
  store.toggleSelectQuery(id)
}

function toggleSelectAllRef() {
  store.selectAllReference(store.reference.map((i) => i.id))
}

function toggleSelectAllQuery() {
  store.selectAllQuery(store.query.map((i) => i.id))
}

function handleRenameRef(prefix: string, start: number, pad: number) {
  store.batchRenameReference(prefix, start, pad)
}

function handleRenameQuery(prefix: string, start: number, pad: number) {
  store.batchRenameQuery(prefix, start, pad)
}

function clearAlignment() {
  store.clear()
  resultStore.clear()
  taskStore.reset()
}
</script>

<template>
  <section class="input-section">
    <header class="section-header">
      <div class="section-title">
        <h2 class="text-xl font-bold">{{ t.input.title }}</h2>
        <p class="section-subtitle">{{ t.input.subtitle }}</p>
      </div>
    </header>

    <div class="guide-area">
      <ProcessGuide />
    </div>

    <div class="section-body">
      <ResponsiveGrid>
        <!-- Reference Panel -->
        <div
          class="input-panel"
          :class="{ 'panel-active': activeTarget === 'reference' }"
          @click="activeTarget = 'reference'"
        >
          <div class="panel-header">
            <div class="panel-title-area">
              <span class="panel-badge ref-badge">R</span>
              <div class="panel-title-group">
                <h3 class="panel-title">{{ t.input.reference }}</h3>
                <span class="panel-title-en">{{ t.input.referenceEn }}</span>
              </div>
              <span class="panel-count" v-if="refCount > 0">{{ refCount }}</span>
            </div>
            <NButton
              v-if="refCount > 0"
              size="tiny"
              quaternary
              type="error"
              @click="store.clearReference()"
            >
              <template #icon>
                <Eraser class="w-3.5 h-3.5" />
              </template>
              {{ t.input.clear }}
            </NButton>
          </div>
          <div class="panel-body">
            <p class="panel-desc">{{ t.input.referenceDesc }}</p>
            <SequenceDropZone
              @files="handleReferenceFiles"
              @paste="showPasteRef = true"
            />
            <SequenceToolbar
              v-if="refCount > 0"
              :count="refCount"
              :selected-count="refSelectedCount"
              :search="searchRef"
              @update:search="searchRef = $event"
              @clear="store.clearReference()"
              @toggle-select-all="toggleSelectAllRef"
              @remove-selected="store.removeSelectedReference()"
              @batch-rename="showRenameRef = true"
            />
            <SequenceList
              :items="store.reference"
              type="reference"
              :search="searchRef"
              :selected-ids="store.selectedRefIds"
              :show-select="true"
              @remove="store.removeReference"
              @reorder="store.reorderReference"
              @toggle-select="toggleSelectRef"
            />
          </div>
        </div>

        <!-- Query Panel -->
        <div
          class="input-panel"
          :class="{ 'panel-active': activeTarget === 'query' }"
          @click="activeTarget = 'query'"
        >
          <div class="panel-header">
            <div class="panel-title-area">
              <span class="panel-badge query-badge">Q</span>
              <div class="panel-title-group">
                <h3 class="panel-title">{{ t.input.query }}</h3>
                <span class="panel-title-en">{{ t.input.queryEn }}</span>
              </div>
              <span class="panel-count" v-if="queryCount > 0">{{ queryCount }}</span>
            </div>
            <NButton
              v-if="queryCount > 0"
              size="tiny"
              quaternary
              type="error"
              @click="store.clearQuery()"
            >
              <template #icon>
                <Eraser class="w-3.5 h-3.5" />
              </template>
              {{ t.input.clear }}
            </NButton>
          </div>
          <div class="panel-body">
            <p class="panel-desc">{{ t.input.queryDesc }}</p>
            <SequenceDropZone
              @files="handleQueryFiles"
              @paste="showPasteQuery = true"
            />
            <SequenceToolbar
              v-if="queryCount > 0"
              :count="queryCount"
              :selected-count="querySelectedCount"
              :search="searchQuery"
              @update:search="searchQuery = $event"
              @clear="store.clearQuery()"
              @toggle-select-all="toggleSelectAllQuery"
              @remove-selected="store.removeSelectedQuery()"
              @batch-rename="showRenameQuery = true"
            />
            <SequenceList
              :items="store.query"
              type="query"
              :search="searchQuery"
              :selected-ids="store.selectedQueryIds"
              :show-select="true"
              @remove="store.removeQuery"
              @reorder="store.reorderQuery"
              @toggle-select="toggleSelectQuery"
            />
          </div>
        </div>
      </ResponsiveGrid>
    </div>

    <!-- Status Bar -->
    <footer class="status-bar" :class="statusClass">
      <div class="status-item">
        <span class="status-label">{{ t.input.reference }}</span>
        <span class="status-value">{{ refCount }}</span>
      </div>
      <div class="status-divider" />
      <div class="status-item">
        <span class="status-label">{{ t.input.query }}</span>
        <span class="status-value">{{ queryCount }}</span>
      </div>
      <div class="status-divider" />
      <div class="status-item status-state">
        <span class="status-dot" />
        <span class="status-text">{{ statusText }}</span>
      </div>
      <NButton
        v-if="refCount > 0 || queryCount > 0"
        size="tiny"
        quaternary
        type="warning"
        class="clear-all-btn"
        @click.stop="clearAlignment"
      >
        <template #icon>
          <RotateCcw class="w-3.5 h-3.5" />
        </template>
        {{ t.input.clearAlignment }}
      </NButton>
    </footer>

    <!-- Paste Dialogs -->
    <PasteDialog
      v-model:show="showPasteRef"
      @parse="handlePaste('reference', $event)"
    />
    <PasteDialog
      v-model:show="showPasteQuery"
      @parse="handlePaste('query', $event)"
    />

    <!-- Batch Rename Dialogs -->
    <BatchRenameDialog
      v-model:show="showRenameRef"
      :count="refCount"
      @confirm="handleRenameRef"
    />
    <BatchRenameDialog
      v-model:show="showRenameQuery"
      :count="queryCount"
      @confirm="handleRenameQuery"
    />
  </section>
</template>

<style scoped>
.input-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.section-header {
  padding: 20px 24px 0;
}

.section-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--textSecondary);
  font-weight: 400;
}

.guide-area {
  padding: 12px 24px 0;
}

.section-body {
  padding: 16px 24px 20px;
}

.input-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-panel.panel-active {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-soft);
}

.panel-header {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  background: var(--card);
}

.panel-title-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-title-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.panel-badge {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.ref-badge {
  background: var(--primary);
}

.query-badge {
  background: var(--success);
}

.panel-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.2;
}

.panel-title-en {
  font-size: 11px;
  color: var(--textSecondary);
  font-weight: 400;
}

.panel-count {
  padding: 2px 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: var(--textSecondary);
  min-width: 22px;
  text-align: center;
}

.panel-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel-desc {
  margin: 0;
  font-size: 12px;
  color: var(--textSecondary);
  line-height: 1.4;
  padding: 6px 10px;
  background: var(--card);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 24px;
  border-top: 1px solid var(--border);
  background: var(--surface);
  font-size: 13px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  color: var(--textSecondary);
  font-size: 12px;
}

.status-value {
  font-weight: 600;
  color: var(--text);
  min-width: 20px;
}

.status-divider {
  width: 1px;
  height: 16px;
  background: var(--border);
}

.status-state {
  margin-left: auto;
}

.clear-all-btn {
  margin-left: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--textSecondary);
}

.status-text {
  font-weight: 500;
  color: var(--textSecondary);
}

.status-ready .status-dot {
  background: var(--success);
  box-shadow: 0 0 0 3px var(--success-soft);
}

.status-ready .status-text {
  color: var(--success);
}

.status-error .status-dot {
  background: var(--danger);
  box-shadow: 0 0 0 3px var(--danger-soft);
}

.status-error .status-text {
  color: var(--danger);
}

@media (max-width: 768px) {
  .section-header {
    padding: 16px 16px 0;
  }

  .guide-area {
    padding: 10px 16px 0;
  }

  .section-body {
    padding: 12px 16px 16px;
  }

  .status-bar {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .status-state {
    margin-left: 0;
    width: 100%;
  }
}
</style>
