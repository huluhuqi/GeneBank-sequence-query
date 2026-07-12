<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NButton, NTag } from 'naive-ui'
import { Play, ArrowLeft, Cpu, Clock, Zap } from 'lucide-vue-next'
import type { SequenceItem } from '../../types/sequence'
import { estimateTask, formatDuration } from '../../utils/taskEstimator'
import { useI18n } from '../../i18n'

const props = defineProps<{
  show: boolean
  reference: SequenceItem[]
  query: SequenceItem[]
  methods: string[]
}>()

const emit = defineEmits<{
  'update:show': [val: boolean]
  start: []
}>()

const { t } = useI18n()

const estimate = computed(() =>
  estimateTask(props.reference, props.query, props.methods.length),
)

const methodNames = computed(() =>
  props.methods.map((m) => {
    switch (m) {
      case 'Sliding':
        return t.analysis.sliding.name
      case 'Local':
        return t.analysis.local.name
      case 'Reverse Complement':
        return t.analysis.reverseComplement.name
      case 'SnapGene':
        return t.analysis.snapgene.name
      default:
        return m
    }
  }),
)

function handleStart() {
  emit('start')
  emit('update:show', false)
}

function handleBack() {
  emit('update:show', false)
}
</script>

<template>
  <NModal
    :show="props.show"
    @update:show="emit('update:show', $event)"
    preset="card"
    :title="t.taskConfirm.title"
    style="width: 560px; max-width: 92vw"
    :bordered="false"
  >
    <div class="confirm-content">
      <!-- 参数概览 -->
      <div class="param-grid">
        <div class="param-card">
          <span class="param-label">{{ t.taskConfirm.refCount }}</span>
          <span class="param-value">{{ reference.length }}</span>
        </div>
        <div class="param-card">
          <span class="param-label">{{ t.taskConfirm.queryCount }}</span>
          <span class="param-value">{{ query.length }}</span>
        </div>
        <div class="param-card">
          <span class="param-label">{{ t.taskConfirm.pairCount }}</span>
          <span class="param-value">{{ Math.min(reference.length, query.length) }}</span>
        </div>
        <div class="param-card">
          <span class="param-label">{{ t.taskConfirm.methodCount }}</span>
          <span class="param-value">{{ methods.length }}</span>
        </div>
      </div>

      <!-- 比对方法 -->
      <div class="section">
        <div class="section-label">{{ t.taskConfirm.methodsLabel }}</div>
        <div class="method-tags">
          <NTag v-for="(name, i) in methodNames" :key="i" type="primary" size="small">
            {{ name }}
          </NTag>
        </div>
      </div>

      <!-- 任务估算 -->
      <div class="estimate-section">
        <div class="section-label">{{ t.taskConfirm.estimateTitle }}</div>
        <div class="estimate-grid">
          <div class="estimate-item">
            <Zap class="w-4 h-4 estimate-icon" />
            <div>
              <div class="estimate-label">{{ t.taskConfirm.totalComparisons }}</div>
              <div class="estimate-value">{{ estimate.total.toLocaleString() }}</div>
            </div>
          </div>
          <div class="estimate-item">
            <Clock class="w-4 h-4 estimate-icon" />
            <div>
              <div class="estimate-label">{{ t.taskConfirm.estimatedTime }}</div>
              <div class="estimate-value">{{ formatDuration(estimate.estimatedSeconds) }}</div>
            </div>
          </div>
          <div class="estimate-item">
            <Cpu class="w-4 h-4 estimate-icon" />
            <div>
              <div class="estimate-label">{{ t.taskConfirm.taskLevel }}</div>
              <div class="estimate-value" :class="`level-${estimate.level}`">
                {{ t.taskConfirm[estimate.levelKey] }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="estimate.suggestBackground" class="bg-tip">
          <Cpu class="w-3.5 h-3.5" />
          <span>{{ t.taskConfirm.suggestBackground }}</span>
        </div>
      </div>

      <!-- 操作 -->
      <div class="action-row">
        <NButton @click="handleBack">
          <template #icon>
            <ArrowLeft class="w-4 h-4" />
          </template>
          {{ t.taskConfirm.back }}
        </NButton>
        <NButton type="primary" size="large" @click="handleStart">
          <template #icon>
            <Play class="w-4 h-4" />
          </template>
          {{ t.taskConfirm.start }}
        </NButton>
      </div>
    </div>
  </NModal>
</template>

<style scoped>
.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.param-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.param-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  text-align: center;
}

.param-label {
  font-size: 11px;
  color: var(--textSecondary);
}

.param-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.method-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.estimate-section {
  padding: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.estimate-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.estimate-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.estimate-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.estimate-label {
  font-size: 11px;
  color: var(--textSecondary);
}

.estimate-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.level-small {
  color: var(--success);
}

.level-medium {
  color: var(--warning);
}

.level-large {
  color: var(--danger);
}

.bg-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--primary-soft);
  border-radius: 6px;
  font-size: 12px;
  color: var(--primary);
}

.action-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

@media (max-width: 560px) {
  .param-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .estimate-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
