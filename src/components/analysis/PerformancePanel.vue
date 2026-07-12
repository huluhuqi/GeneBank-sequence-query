<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { NButton, NProgress } from 'naive-ui'
import {
  Cpu,
  Gauge,
  MemoryStick,
  Zap,
  Activity,
  Play,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-vue-next'
import { useTaskStore } from '../../stores/task'
import { useI18n } from '../../i18n'
import {
  STRESS_TEST_SCENARIOS,
  runStressTest,
  getMemoryUsage,
  type PerformanceMetrics,
  type StressTestScenario,
} from '../../test/performance/benchmark'

const { t } = useI18n()
const task = useTaskStore()

// ============ 实时监控 ============
const cpuCores = computed(() => navigator.hardwareConcurrency || 2)
const workerCount = computed(() => Math.max(1, cpuCores.value - 1))

const memoryMb = ref(0)
let memTimer: number | null = null

function startMemPolling() {
  if (memTimer !== null) return
  memTimer = window.setInterval(() => {
    memoryMb.value = getMemoryUsage()
  }, 1000)
}

function stopMemPolling() {
  if (memTimer !== null) {
    clearInterval(memTimer)
    memTimer = null
  }
}

// 速度计算
const elapsedSec = ref(0)
const speedPairPerSec = computed(() => {
  if (elapsedSec.value <= 0 || task.finished <= 0) return 0
  return Math.round(task.finished / elapsedSec.value)
})

let speedTimer: number | null = null
const startTime = ref(0)

watch(
  () => task.running,
  (running) => {
    if (running) {
      startTime.value = Date.now()
      startMemPolling()
      startSpeedTimer()
    } else {
      stopMemPolling()
      stopSpeedTimer()
    }
  },
)

function startSpeedTimer() {
  if (speedTimer !== null) return
  speedTimer = window.setInterval(() => {
    elapsedSec.value = (Date.now() - startTime.value) / 1000
  }, 500)
}

function stopSpeedTimer() {
  if (speedTimer !== null) {
    clearInterval(speedTimer)
    speedTimer = null
  }
}

const progressPercent = computed(() => Math.round(task.progress))
const isRunning = computed(() => task.running)

// ============ 压测系统 ============
const showStressTest = ref(false)
const stressRunning = ref(false)
const currentScenario = ref<string>('')
const stressProgress = ref({ current: 0, total: 0, phase: '' })
const stressResults = ref<PerformanceMetrics[]>([])
const stressError = ref('')

async function runScenario(scenario: StressTestScenario) {
  if (stressRunning.value) return
  stressRunning.value = true
  stressError.value = ''
  currentScenario.value = scenario.name

  try {
    const metrics = await runStressTest({
      scenario,
      methods: ['Sliding'],
      onProgress: (p) => {
        stressProgress.value = {
          current: p.current,
          total: p.total,
          phase: p.phase,
        }
      },
    })
    stressResults.value.push(metrics)
  } catch (e) {
    stressError.value = e instanceof Error ? e.message : String(e)
  } finally {
    stressRunning.value = false
    currentScenario.value = ''
  }
}

function clearStressResults() {
  stressResults.value = []
  stressError.value = ''
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

function formatMemory(mb: number): string {
  if (mb <= 0) return 'N/A'
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}

const phaseLabel = computed(() => {
  const phase = stressProgress.value.phase
  if (phase === 'generating') return t.performance.phaseGenerating
  if (phase === 'running') return t.performance.phaseRunning
  if (phase === 'done') return t.performance.phaseDone
  return ''
})

onUnmounted(() => {
  stopMemPolling()
  stopSpeedTimer()
})
</script>

<template>
  <section class="performance-panel">
    <header class="panel-header">
      <div class="header-title">
        <div class="header-icon">
          <Activity class="w-5 h-5" />
        </div>
        <div>
          <h2 class="title-text">{{ t.performance.title }}</h2>
          <p class="title-sub">{{ t.performance.subtitle }}</p>
        </div>
      </div>
      <NButton
        size="small"
        quaternary
        @click="showStressTest = !showStressTest"
      >
        {{ showStressTest ? t.performance.hideStressTest : t.performance.showStressTest }}
      </NButton>
    </header>

    <div class="panel-body">
      <!-- 实时监控指标 -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon cpu-icon">
            <Cpu class="w-4 h-4" />
          </div>
          <div class="metric-content">
            <div class="metric-label">{{ t.performance.cpuWorkers }}</div>
            <div class="metric-value">
              {{ workerCount }}
              <span class="metric-unit">{{ t.performance.unitCores }}</span>
            </div>
            <div class="metric-sub">{{ t.performance.totalCores }}: {{ cpuCores }}</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon progress-icon">
            <Gauge class="w-4 h-4" />
          </div>
          <div class="metric-content">
            <div class="metric-label">{{ t.performance.completion }}</div>
            <div class="metric-value">
              {{ progressPercent }}<span class="metric-unit">%</span>
            </div>
            <div class="metric-sub">{{ task.finished }} / {{ task.total }}</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon speed-icon">
            <Zap class="w-4 h-4" />
          </div>
          <div class="metric-content">
            <div class="metric-label">{{ t.performance.speed }}</div>
            <div class="metric-value">
              {{ speedPairPerSec.toLocaleString() }}
              <span class="metric-unit">{{ t.performance.unitPairPerSec }}</span>
            </div>
            <div class="metric-sub">{{ t.performance.elapsed }}: {{ elapsedSec.toFixed(1) }}s</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon memory-icon">
            <MemoryStick class="w-4 h-4" />
          </div>
          <div class="metric-content">
            <div class="metric-label">{{ t.performance.memory }}</div>
            <div class="metric-value">
              {{ formatMemory(memoryMb) }}
            </div>
            <div class="metric-sub">{{ t.performance.results }}: {{ task.successCount }}</div>
          </div>
        </div>
      </div>

      <!-- 任务进度条 -->
      <div v-if="isRunning" class="task-progress">
        <NProgress
          type="line"
          :percentage="progressPercent"
          :show-indicator="false"
          :height="6"
          color="var(--primary)"
          rail-color="var(--surface)"
        />
      </div>

      <!-- 压测系统 -->
      <Transition name="expand">
        <div v-if="showStressTest" class="stress-section">
          <div class="stress-header">
            <h3 class="stress-title">{{ t.performance.stressTestTitle }}</h3>
            <p class="stress-desc">{{ t.performance.stressTestDesc }}</p>
          </div>

          <!-- 场景按钮 -->
          <div class="scenario-grid">
            <button
              v-for="scenario in STRESS_TEST_SCENARIOS"
              :key="scenario.name"
              class="scenario-card"
              :class="{ active: currentScenario === scenario.name }"
              :disabled="stressRunning"
              @click="runScenario(scenario)"
            >
              <div class="scenario-name">
                {{ scenario.name }}
                <span class="scenario-name-en">({{ scenario.nameEn }})</span>
              </div>
              <div class="scenario-detail">
                {{ scenario.referenceCount }} × {{ scenario.queryCount }}
              </div>
              <div class="scenario-len">
                {{ scenario.refLength }}bp / {{ scenario.queryLength }}bp
              </div>
              <Loader2 v-if="currentScenario === scenario.name && stressRunning" class="w-4 h-4 spinning scenario-loader" />
              <CheckCircle v-else-if="stressResults.some(r => r.scenarioName === scenario.name)" class="w-4 h-4 scenario-done" />
              <Play v-else class="w-4 h-4 scenario-play" />
            </button>
          </div>

          <!-- 当前压测进度 -->
          <div v-if="stressRunning" class="stress-progress">
            <Loader2 class="w-4 h-4 spinning" />
            <span>{{ currentScenario }} - {{ phaseLabel }}</span>
            <span class="stress-progress-num">{{ stressProgress.current }} / {{ stressProgress.total }}</span>
          </div>

          <!-- 错误提示 -->
          <div v-if="stressError" class="stress-error">
            <AlertTriangle class="w-4 h-4" />
            <span>{{ stressError }}</span>
          </div>

          <!-- 压测结果表 -->
          <div v-if="stressResults.length > 0" class="stress-results">
            <div class="results-header">
              <h4 class="results-title">{{ t.performance.resultsTableTitle }}</h4>
              <NButton size="tiny" quaternary @click="clearStressResults">
                {{ t.performance.clearResults }}
              </NButton>
            </div>
            <div class="results-table-wrap">
              <table class="results-table">
                <thead>
                  <tr>
                    <th>{{ t.performance.colScenario }}</th>
                    <th>{{ t.performance.colDuration }}</th>
                    <th>{{ t.performance.colMemory }}</th>
                    <th>{{ t.performance.colWorkers }}</th>
                    <th>{{ t.performance.colResults }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in stressResults" :key="i">
                    <td>{{ r.scenarioName }}</td>
                    <td>{{ formatDuration(r.duration) }}</td>
                    <td>{{ formatMemory(r.memory) }}</td>
                    <td>{{ r.workerCount }}</td>
                    <td>{{ r.resultCount.toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.performance-panel {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.panel-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--success-soft);
  color: var(--success);
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-text {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.title-sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--textSecondary);
  font-weight: 400;
}

.panel-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.metric-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.metric-card:hover {
  border-color: var(--primary);
}

.metric-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cpu-icon {
  background: var(--primary-soft);
  color: var(--primary);
}

.progress-icon {
  background: var(--primary-soft);
  color: var(--secondary);
}

.speed-icon {
  background: var(--warning-soft);
  color: var(--warning);
}

.memory-icon {
  background: var(--success-soft);
  color: var(--success);
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-label {
  font-size: 11px;
  color: var(--textSecondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.1;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.metric-unit {
  font-size: 12px;
  font-weight: 500;
  color: var(--textSecondary);
}

.metric-sub {
  font-size: 11px;
  color: var(--textSecondary);
  margin-top: 4px;
}

.task-progress {
  padding: 4px 0;
}

.stress-section {
  border-top: 1px dashed var(--border);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stress-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stress-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.stress-desc {
  margin: 0;
  font-size: 12px;
  color: var(--textSecondary);
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.scenario-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  position: relative;
  color: var(--text);
  font-family: inherit;
}

.scenario-card:hover:not(:disabled) {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.scenario-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.scenario-card.active {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.scenario-name {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.scenario-name-en {
  font-size: 11px;
  color: var(--textSecondary);
  font-weight: 400;
}

.scenario-detail {
  font-size: 13px;
  color: var(--primary);
  font-weight: 500;
}

.scenario-len {
  font-size: 11px;
  color: var(--textSecondary);
}

.scenario-play {
  position: absolute;
  top: 12px;
  right: 12px;
  color: var(--textSecondary);
}

.scenario-loader {
  position: absolute;
  top: 12px;
  right: 12px;
  color: var(--primary);
}

.scenario-done {
  position: absolute;
  top: 12px;
  right: 12px;
  color: var(--success);
}

.stress-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  color: var(--text);
}

.stress-progress-num {
  margin-left: auto;
  font-weight: 600;
  color: var(--primary);
}

.stress-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--danger-soft);
  border: 1px solid var(--danger-soft);
  border-radius: 10px;
  font-size: 13px;
  color: var(--danger);
}

.stress-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.results-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.results-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.results-table th,
.results-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.results-table th {
  background: var(--surface);
  font-weight: 600;
  color: var(--textSecondary);
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.3px;
}

.results-table tbody tr:last-child td {
  border-bottom: none;
}

.results-table tbody tr:hover {
  background: var(--surface);
}

.results-table td {
  color: var(--text);
}

.spinning {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
}

.expand-enter-to,
.expand-leave-from {
  max-height: 800px;
}

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .panel-header,
  .panel-body {
    padding-left: 16px;
    padding-right: 16px;
  }

  .scenario-grid {
    grid-template-columns: 1fr;
  }
}
</style>
