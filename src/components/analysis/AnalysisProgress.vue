<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { NButton, NTag } from 'naive-ui'
import { Pause, Play, XCircle, Clock, CheckCircle, Loader2 } from 'lucide-vue-next'
import { useTaskStore } from '../../stores/task'
import { formatDuration } from '../../utils/taskEstimator'
import { useI18n } from '../../i18n'

const props = defineProps<{
  startTime?: number
}>()

const emit = defineEmits<{
  pause: []
  resume: []
  cancel: []
}>()

const { t } = useI18n()
const task = useTaskStore()

const progressPercent = computed(() => Math.round(task.progress))
const isRunning = computed(() => task.running && !task.paused)
const isPaused = computed(() => task.paused)
const isCompleted = computed(() => !task.running && task.progress >= 100)

// 已用时间（秒）
const elapsed = ref(0)
const now = ref(Date.now())
let timer: number | null = null

const startTs = ref(props.startTime || Date.now())

watch(
  () => task.running,
  (running) => {
    if (running) {
      startTs.value = props.startTime || Date.now()
      startTimer()
    } else {
      stopTimer()
    }
  },
)

function startTimer() {
  if (timer !== null) return
  timer = window.setInterval(() => {
    now.value = Date.now()
    elapsed.value = (now.value - startTs.value) / 1000
  }, 200)
}

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

// 预计剩余时间
const estimatedRemaining = computed(() => {
  if (task.progress <= 0 || task.progress >= 100) return 0
  const remainRatio = (100 - task.progress) / task.progress
  return elapsed.value * remainRatio
})

startTimer()
onUnmounted(stopTimer)
</script>

<template>
  <div class="progress-panel">
    <div class="progress-header">
      <div class="header-left">
        <div class="header-icon" :class="{ spinning: isRunning }">
          <Loader2 v-if="isRunning" class="w-5 h-5" />
          <Pause v-else-if="isPaused" class="w-5 h-5" />
          <CheckCircle v-else-if="isCompleted" class="w-5 h-5" />
          <Loader2 v-else class="w-5 h-5" />
        </div>
        <div class="header-text">
          <div class="header-title">
            {{ isCompleted ? t.analysis.stateCompleted : isPaused ? t.analysis.statePaused : t.analysis.stateRunning }}
          </div>
          <div class="header-sub">
            {{ task.finished }} / {{ task.total }} ({{ progressPercent }}%)
          </div>
        </div>
      </div>
      <NTag v-if="isRunning" type="info" size="small" :bordered="false">
        {{ t.taskProgress.processing }}
      </NTag>
      <NTag v-else-if="isPaused" type="warning" size="small" :bordered="false">
        {{ t.taskProgress.pausedLabel }}
      </NTag>
      <NTag v-else-if="isCompleted" type="success" size="small" :bordered="false">
        {{ t.taskProgress.completedLabel }}
      </NTag>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar-wrap">
      <div class="progress-bar" :style="{ width: progressPercent + '%' }" />
    </div>

    <!-- 统计信息 -->
    <div class="stats-grid">
      <div class="stat-item">
        <Clock class="w-3.5 h-3.5 stat-icon" />
        <div>
          <div class="stat-label">{{ t.taskProgress.elapsed }}</div>
          <div class="stat-value">{{ formatDuration(elapsed) }}</div>
        </div>
      </div>
      <div v-if="!isCompleted && task.progress > 0" class="stat-item">
        <Clock class="w-3.5 h-3.5 stat-icon" />
        <div>
          <div class="stat-label">{{ t.taskProgress.remaining }}</div>
          <div class="stat-value">{{ formatDuration(estimatedRemaining) }}</div>
        </div>
      </div>
      <div class="stat-item">
        <CheckCircle class="w-3.5 h-3.5 stat-icon stat-success" />
        <div>
          <div class="stat-label">{{ t.taskProgress.success }}</div>
          <div class="stat-value">{{ task.successCount }}</div>
        </div>
      </div>
      <div v-if="task.errorCount > 0" class="stat-item">
        <XCircle class="w-3.5 h-3.5 stat-icon stat-danger" />
        <div>
          <div class="stat-label">{{ t.taskProgress.failed }}</div>
          <div class="stat-value">{{ task.errorCount }}</div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="task.running" class="action-row">
      <NButton
        v-if="!task.paused"
        size="small"
        @click="emit('pause')"
      >
        <template #icon>
          <Pause class="w-4 h-4" />
        </template>
        {{ t.analysis.pause }}
      </NButton>
      <NButton
        v-else
        size="small"
        type="success"
        @click="emit('resume')"
      >
        <template #icon>
          <Play class="w-4 h-4" />
        </template>
        {{ t.analysis.resume }}
      </NButton>
      <NButton
        size="small"
        type="error"
        quaternary
        @click="emit('cancel')"
      >
        <template #icon>
          <XCircle class="w-4 h-4" />
        </template>
        {{ t.analysis.cancel }}
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.progress-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow);
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-soft);
  color: var(--primary);
}

.header-icon.spinning {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.header-sub {
  font-size: 12px;
  color: var(--textSecondary);
  margin-top: 2px;
}

.progress-bar-wrap {
  height: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 999px;
  transition: width 0.3s ease;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.stat-icon {
  color: var(--textSecondary);
  flex-shrink: 0;
}

.stat-success {
  color: var(--success);
}

.stat-danger {
  color: var(--danger);
}

.stat-label {
  font-size: 11px;
  color: var(--textSecondary);
}

.stat-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 560px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-row {
    flex-direction: column;
  }

  .action-row > * {
    width: 100%;
  }
}
</style>
