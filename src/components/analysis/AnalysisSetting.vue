<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { NCheckbox, NButton } from 'naive-ui'
import { Play, PlayCircle, XCircle, Zap, Target, ArrowRightLeft, GitCompare, Sparkles, Settings2 } from 'lucide-vue-next'
import { useSequenceStore } from '../../stores/sequence'
import { useResultStore } from '../../stores/result'
import { useTaskStore } from '../../stores/task'
import { useHistoryStore } from '../../stores/history'
import { AlignmentScheduler } from '../../engine/alignment/scheduler'
import type { AlignmentConfig } from '../../engine/alignment/alignmentManager'
import TaskCheckDialog from './TaskCheckDialog.vue'
import AnalysisConfirm from './AnalysisConfirm.vue'
import AnalysisProgress from './AnalysisProgress.vue'
import Tooltip from '../common/Tooltip.vue'
import { useMessage } from 'naive-ui'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const seqStore = useSequenceStore()
const resultStore = useResultStore()
const taskStore = useTaskStore()
const historyStore = useHistoryStore()
const message = useMessage()

const methodMode = ref<'auto' | 'manual'>('auto')

const methods = ref({
  sliding: true,
  local: true,
  reverseComplement: true,
  snapgene: false,
})

// 流程控制：check → confirm → run
const showCheckDialog = ref(false)
const showConfirmDialog = ref(false)
const analysisStartTime = ref(0)

let scheduler: AlignmentScheduler | null = null

const selectedMethods = computed(() => {
  const arr: string[] = []
  if (methods.value.sliding) arr.push('Sliding')
  if (methods.value.local) arr.push('Local')
  if (methods.value.reverseComplement) arr.push('Reverse Complement')
  if (methods.value.snapgene) arr.push('SnapGene')
  return arr
})

const autoDetectMethods = computed(() => {
  if (seqStore.query.length === 0) return []
  const first = seqStore.query[0]
  const len = first.sequence.length
  // 短序列定位模式（siRNA/primer/oligo）：Local + SnapGene + RC
  if (len <= 50) return ['Local', 'SnapGene', 'Sliding', 'Reverse Complement']
  if (len <= 100) return ['Sliding', 'Local', 'Reverse Complement']
  if (len <= 1000) return ['Local', 'SnapGene', 'Reverse Complement']
  return ['SnapGene', 'Reverse Complement']
})

const displayMethods = computed(() => {
  if (methodMode.value === 'auto') return autoDetectMethods.value
  return selectedMethods.value
})

function isMethodActive(method: string): boolean {
  return displayMethods.value.includes(method)
}

const canAnalyze = computed(() => {
  return (
    seqStore.reference.length > 0 &&
    seqStore.query.length > 0 &&
    !taskStore.running &&
    displayMethods.value.length > 0
  )
})

const analysisState = computed(() => {
  if (taskStore.running && !taskStore.paused) return 'running'
  if (taskStore.paused) return 'paused'
  if (taskStore.progress >= 100 && resultStore.results.length > 0) return 'completed'
  return 'idle'
})

const stateLabel = computed(() => {
  switch (analysisState.value) {
    case 'running': return t.analysis.stateRunning
    case 'paused': return t.analysis.statePaused
    case 'completed': return t.analysis.stateCompleted
    default: return t.analysis.stateIdle
  }
})

// 新流程入口：先打开检查弹窗
function startCheckFlow() {
  if (!canAnalyze.value) return
  showCheckDialog.value = true
}

// 检查通过 → 打开确认弹窗
function handleCheckConfirm() {
  showConfirmDialog.value = true
}

// 确认 → 真正开始分析
async function handleConfirmStart() {
  await runAnalysis()
}

async function runAnalysis() {
  // 数量不一致时阻止
  if (seqStore.reference.length !== seqStore.query.length) return

  resultStore.clear()
  taskStore.start(Math.min(seqStore.reference.length, seqStore.query.length))
  analysisStartTime.value = Date.now()

  const effectiveMethods: AlignmentConfig = methodMode.value === 'auto'
    ? { autoSelect: true }
    : { autoSelect: false, methods: selectedMethods.value }

  scheduler = new AlignmentScheduler({
    methods: effectiveMethods,
    onProgress: (progress) => {
      taskStore.update(
        progress.current,
        progress.total,
        progress.successCount,
        progress.errors,
      )
    },
    onResult: (newResults) => {
      // 流式增量更新：结果实时显示在结果面板
      resultStore.appendResults(newResults)
    },
    onComplete: (results) => {
      resultStore.setResults(results)
      taskStore.complete()
      const duration = (Date.now() - analysisStartTime.value) / 1000
      // 保存到历史记录
      historyStore.add({
        name: `分析任务 ${new Date().toLocaleString('zh-CN')}`,
        referenceCount: seqStore.reference.length,
        queryCount: seqStore.query.length,
        methods: selectedMethods.value,
        resultCount: results.length,
        duration,
      })
      message.success(t.analysis.complete.replace('{count}', String(results.length)))
      scheduler = null
    },
  })

  try {
    await scheduler.start(seqStore.reference, seqStore.query)
  } catch (e) {
    message.error(t.analysis.failedMsg.replace('{error}', e instanceof Error ? e.message : String(e)))
    taskStore.cancel()
    scheduler = null
  }
}

function pauseAnalysis() {
  scheduler?.pause()
  taskStore.pause()
}

function resumeAnalysis() {
  scheduler?.resume()
  taskStore.resume()
}

function cancelAnalysis() {
  scheduler?.cancel()
  taskStore.cancel()
  message.warning(t.analysis.cancelled)
  scheduler = null
}

onUnmounted(() => {
  if (scheduler) {
    scheduler.cancel()
    scheduler = null
  }
})
</script>

<template>
  <section class="analysis-section">
    <header class="section-header">
      <div class="section-title">
        <div class="section-icon">
          <Zap class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold">{{ t.analysis.title }}</h2>
          <p class="section-subtitle">{{ t.analysis.subtitle }}</p>
        </div>
      </div>
      <div class="state-badge" :class="analysisState">
        <span class="state-dot" />
        <span class="state-text">{{ stateLabel }}</span>
      </div>
    </header>

    <div class="section-body">
      <!-- Method Selector -->
      <div class="method-selector">
        <div class="method-header">
          <h3 class="method-title">{{ t.analysis.methodTitle }}</h3>
          <div class="mode-switch">
            <button
              class="mode-btn"
              :class="{ active: methodMode === 'auto' }"
              @click="methodMode = 'auto'"
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>{{ t.analysis.modeAuto }}</span>
            </button>
            <button
              class="mode-btn"
              :class="{ active: methodMode === 'manual' }"
              @click="methodMode = 'manual'"
            >
              <Settings2 class="w-3.5 h-3.5" />
              <span>{{ t.analysis.modeManual }}</span>
            </button>
          </div>
        </div>
        <div v-if="methodMode === 'auto'" class="auto-hint">
          <Sparkles class="w-4 h-4" />
          <span>
            {{ t.analysis.autoHint.replace('{count}', String(autoDetectMethods.length)) }}
          </span>
        </div>
        <div class="method-grid" :class="{ 'auto-mode': methodMode === 'auto' }">
          <label class="method-card" :class="{ active: isMethodActive('Sliding') }">
            <div class="method-icon sliding-icon">
              <ArrowRightLeft class="w-5 h-5" />
            </div>
            <div class="method-info">
              <span class="method-name">{{ t.analysis.sliding.name }}</span>
              <span class="method-desc">{{ t.analysis.sliding.desc }}</span>
            </div>
            <Tooltip :text="t.analysis.sliding.detail" />
            <NCheckbox :checked="isMethodActive('Sliding')" :disabled="methodMode === 'auto'" @update:checked="methods.sliding = $event" />
          </label>

          <label class="method-card" :class="{ active: isMethodActive('Local') }">
            <div class="method-icon local-icon">
              <Target class="w-5 h-5" />
            </div>
            <div class="method-info">
              <span class="method-name">{{ t.analysis.local.name }}</span>
              <span class="method-desc">{{ t.analysis.local.desc }}</span>
            </div>
            <Tooltip :text="t.analysis.local.detail" />
            <NCheckbox :checked="isMethodActive('Local')" :disabled="methodMode === 'auto'" @update:checked="methods.local = $event" />
          </label>

          <label class="method-card" :class="{ active: isMethodActive('Reverse Complement') }">
            <div class="method-icon rc-icon">
              <PlayCircle class="w-5 h-5" />
            </div>
            <div class="method-info">
              <span class="method-name">{{ t.analysis.reverseComplement.name }}</span>
              <span class="method-desc">{{ t.analysis.reverseComplement.desc }}</span>
            </div>
            <Tooltip :text="t.analysis.reverseComplement.detail" />
            <NCheckbox :checked="isMethodActive('Reverse Complement')" :disabled="methodMode === 'auto'" @update:checked="methods.reverseComplement = $event" />
          </label>

          <label class="method-card" :class="{ active: isMethodActive('SnapGene') }">
            <div class="method-icon snapgene-icon">
              <GitCompare class="w-5 h-5" />
            </div>
            <div class="method-info">
              <span class="method-name">{{ t.analysis.snapgene.name }}</span>
              <span class="method-desc">{{ t.analysis.snapgene.desc }}</span>
            </div>
            <Tooltip :text="t.analysis.snapgene.detail" />
            <NCheckbox :checked="isMethodActive('SnapGene')" :disabled="methodMode === 'auto'" @update:checked="methods.snapgene = $event" />
          </label>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="action-bar">
        <div v-if="seqStore.reference.length !== seqStore.query.length" class="mismatch-warning">
          <XCircle class="w-4 h-4" />
          <span>{{ t.analysis.mismatchWarning }}</span>
        </div>

        <div class="action-buttons">
          <NButton
            v-if="!taskStore.running"
            type="primary"
            size="large"
            :disabled="!canAnalyze"
            @click="startCheckFlow"
            class="analyze-btn"
          >
            <template #icon>
              <Play class="w-4 h-4" />
            </template>
            {{ t.analysis.start }}
          </NButton>
        </div>
      </div>
    </div>

    <!-- Progress Panel -->
    <Transition name="expand">
      <div v-if="taskStore.running || taskStore.progress > 0" class="progress-section">
        <AnalysisProgress
          :start-time="analysisStartTime"
          @pause="pauseAnalysis"
          @resume="resumeAnalysis"
          @cancel="cancelAnalysis"
        />
      </div>
    </Transition>

    <!-- 任务检查弹窗 -->
    <TaskCheckDialog
      v-model:show="showCheckDialog"
      :reference="seqStore.reference"
      :query="seqStore.query"
      @confirm="handleCheckConfirm"
    />

    <!-- 参数确认弹窗 -->
    <AnalysisConfirm
      v-model:show="showConfirmDialog"
      :reference="seqStore.reference"
      :query="seqStore.query"
      :methods="selectedMethods"
      @start="handleConfirmStart"
    />
  </section>
</template>

<style scoped>
.analysis-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.section-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--textSecondary);
  font-weight: 400;
}

.state-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  background: var(--surface);
  border: 1px solid var(--border);
}

.state-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--textSecondary);
}

.state-text {
  color: var(--textSecondary);
}

.state-badge.idle .state-dot { background: var(--textSecondary); }
.state-badge.idle .state-text { color: var(--textSecondary); }

.state-badge.running .state-dot {
  background: var(--primary);
  animation: pulse 1.5s ease-in-out infinite;
}
.state-badge.running .state-text { color: var(--primary); }

.state-badge.paused .state-dot { background: var(--warning); }
.state-badge.paused .state-text { color: var(--warning); }

.state-badge.completed .state-dot { background: var(--success); }
.state-badge.completed .state-text { color: var(--success); }

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

.section-body {
  padding: 20px 24px;
}

.method-selector {
  margin-bottom: 20px;
}

.method-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.method-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--textSecondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mode-switch {
  display: flex;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: none;
  background: transparent;
  color: var(--textSecondary);
  font-size: 11px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  color: var(--text);
}

.mode-btn.active {
  background: var(--primary);
  color: white;
}

.auto-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
  background: var(--primary-soft);
  border: 1px solid var(--primary-soft);
  border-radius: 8px;
  font-size: 12px;
  color: var(--primary);
}

.method-grid.auto-mode .method-card {
  cursor: default;
}

.method-grid.auto-mode .method-card:hover {
  border-color: var(--border);
  background: var(--surface);
}

.method-grid.auto-mode .method-card.active:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.method-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.method-card:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.method-card.active {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.method-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sliding-icon {
  background: var(--primary-soft);
  color: var(--primary);
}

.local-icon {
  background: var(--success-soft);
  color: var(--success);
}

.rc-icon {
  background: var(--primary-soft);
  color: var(--secondary);
}

.snapgene-icon {
  background: var(--warning-soft);
  color: var(--warning);
}

.method-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.method-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.method-desc {
  font-size: 11px;
  color: var(--textSecondary);
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.mismatch-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--danger);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.analyze-btn {
  min-width: 160px;
}

.progress-section {
  padding: 0 24px 20px;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 300px;
}

@media (max-width: 900px) {
  .method-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1200px) {
  .method-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .section-header {
    padding: 14px 16px;
  }

  .section-body {
    padding: 16px;
  }

  .progress-section {
    padding: 0 16px 16px;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    margin-left: 0;
  }

  .action-buttons > * {
    flex: 1;
  }

  .analyze-btn {
    width: 100%;
  }
}
</style>
