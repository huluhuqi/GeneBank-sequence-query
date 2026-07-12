<script setup lang="ts">
import { computed } from 'vue'
import { NProgress, NButton, NTag } from 'naive-ui'
import { Pause, Play, XCircle, CheckCircle, AlertCircle } from 'lucide-vue-next'
import { useTaskStore } from '../../stores/task'
import { useI18n } from '../../i18n'

const emit = defineEmits<{
  pause: []
  resume: []
  cancel: []
}>()

const { t } = useI18n()
const task = useTaskStore()

const progressPercent = computed(() => Math.round(task.progress))
</script>

<template>
  <div v-if="task.running || task.progress > 0" class="task-progress">
    <div class="progress-header">
      <div class="progress-title">
        <h3 class="text-lg font-bold">{{ t.analysis.progress }}</h3>
        <NTag v-if="task.running && !task.paused" type="info" size="small">
          {{ t.analysis.stateRunning }}
        </NTag>
        <NTag v-else-if="task.paused" type="warning" size="small">
          {{ t.analysis.statePaused }}
        </NTag>
        <NTag v-else-if="task.progress >= 100" type="success" size="small">
          {{ t.analysis.stateCompleted }}
        </NTag>
      </div>

      <div class="progress-actions">
        <NButton
          v-if="task.running && !task.paused"
          size="small"
          quaternary
          @click="emit('pause')"
        >
          <template #icon>
            <Pause class="w-4 h-4" />
          </template>
          {{ t.analysis.pause }}
        </NButton>
        <NButton
          v-if="task.paused"
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
          v-if="task.running"
          size="small"
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

    <NProgress
      type="line"
      :percentage="progressPercent"
      :height="10"
      :border-radius="5"
      :show-indicator="true"
    />

    <div class="progress-stats mt-2 text-sm" style="color: var(--textSecondary)">
      <div class="stats-left">
        <span>
          {{ task.finished }} / {{ task.total }}
        </span>
        <span class="flex items-center gap-1" style="color: var(--success)">
          <CheckCircle class="w-3.5 h-3.5" />
          {{ task.successCount }} {{ t.analysis.success }}
        </span>
        <span v-if="task.errorCount > 0" class="flex items-center gap-1" style="color: var(--danger)">
          <AlertCircle class="w-3.5 h-3.5" />
          {{ task.errorCount }} {{ t.analysis.failed }}
        </span>
      </div>
      <span v-if="task.successCount > 0" class="stats-right">
        {{ task.successCount }} {{ t.analysis.results }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.task-progress {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow);
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.progress-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.progress-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.progress-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.stats-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.stats-right {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .task-progress {
    padding: 16px;
  }

  .progress-header {
    flex-direction: column;
    align-items: stretch;
  }

  .progress-actions {
    width: 100%;
  }

  .progress-actions > * {
    flex: 1;
  }

  .progress-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    font-size: 12px;
  }

  .stats-left {
    gap: 10px;
  }
}
</style>
