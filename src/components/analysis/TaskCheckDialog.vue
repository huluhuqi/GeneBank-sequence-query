<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NButton } from 'naive-ui'
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-vue-next'
import type { SequenceItem } from '../../types/sequence'
import { useI18n } from '../../i18n'

const props = defineProps<{
  show: boolean
  reference: SequenceItem[]
  query: SequenceItem[]
}>()

const emit = defineEmits<{
  'update:show': [val: boolean]
  confirm: []
}>()

const { t } = useI18n()

type CheckStatus = 'success' | 'error' | 'warning'

interface CheckItem {
  title: string
  status: CheckStatus
  detail: string
}

const checks = computed<CheckItem[]>(() => {
  const items: CheckItem[] = []

  // 1. 数量检查
  const refCount = props.reference.length
  const queryCount = props.query.length
  const countStatus: CheckStatus = refCount === queryCount ? 'success' : 'error'
  const countDetail =
    refCount === queryCount
      ? t.taskCheck.countOk.replace('{count}', String(refCount))
      : t.taskCheck.countMismatch
          .replace('{ref}', String(refCount))
          .replace('{query}', String(queryCount))
          .replace('{diff}', String(Math.abs(refCount - queryCount)))
  items.push({ title: t.taskCheck.countTitle, status: countStatus, detail: countDetail })

  // 2. 空序列检查
  const emptyRef = props.reference.filter((s) => !s.sequence || s.sequence.length === 0)
  const emptyQuery = props.query.filter((s) => !s.sequence || s.sequence.length === 0)
  const emptyTotal = emptyRef.length + emptyQuery.length
  const emptyStatus: CheckStatus = emptyTotal === 0 ? 'success' : 'warning'
  const emptyDetail =
    emptyTotal === 0
      ? t.taskCheck.emptyOk
      : t.taskCheck.emptyFound.replace('{count}', String(emptyTotal))
  items.push({ title: t.taskCheck.emptyTitle, status: emptyStatus, detail: emptyDetail })

  // 3. 重复 ID 检查
  const refIds = props.reference.map((s) => s.id)
  const queryIds = props.query.map((s) => s.id)
  const allIds = [...refIds, ...queryIds]
  const dupSet = new Set<string>()
  const seen = new Set<string>()
  allIds.forEach((id) => {
    if (seen.has(id)) dupSet.add(id)
    seen.add(id)
  })
  const dupCount = dupSet.size
  const dupStatus: CheckStatus = dupCount === 0 ? 'success' : 'error'
  const dupDetail =
    dupCount === 0
      ? t.taskCheck.dupOk
      : t.taskCheck.dupFound.replace('{count}', String(dupCount))
  items.push({ title: t.taskCheck.dupTitle, status: dupStatus, detail: dupDetail })

  return items
})

const hasError = computed(() => checks.value.some((c) => c.status === 'error'))
const hasWarning = computed(() => checks.value.some((c) => c.status === 'warning'))
const canProceed = computed(() => !hasError.value)

const statusIcon = (status: CheckStatus) => {
  switch (status) {
    case 'success':
      return CheckCircle2
    case 'error':
      return XCircle
    case 'warning':
      return AlertTriangle
  }
}

const statusColor = (status: CheckStatus) => {
  switch (status) {
    case 'success':
      return 'var(--success)'
    case 'error':
      return 'var(--danger)'
    case 'warning':
      return 'var(--warning)'
  }
}

function handleConfirm() {
  emit('confirm')
  emit('update:show', false)
}

function handleClose() {
  emit('update:show', false)
}
</script>

<template>
  <NModal
    :show="props.show"
    @update:show="emit('update:show', $event)"
    preset="card"
    :title="t.taskCheck.title"
    style="width: 520px; max-width: 92vw"
    :bordered="false"
  >
    <div class="check-content">
      <p class="check-tip">{{ t.taskCheck.tip }}</p>

      <div class="check-list">
        <div
          v-for="(item, idx) in checks"
          :key="idx"
          class="check-item"
          :class="`status-${item.status}`"
        >
          <component
            :is="statusIcon(item.status)"
            class="w-5 h-5 check-icon"
            :style="{ color: statusColor(item.status) }"
          />
          <div class="check-body">
            <div class="check-title">{{ item.title }}</div>
            <div class="check-detail">{{ item.detail }}</div>
          </div>
        </div>
      </div>

      <div v-if="hasWarning && !hasError" class="warning-banner">
        <AlertTriangle class="w-4 h-4" />
        <span>{{ t.taskCheck.warningCanProceed }}</span>
      </div>

      <div v-if="hasError" class="error-banner">
        <XCircle class="w-4 h-4" />
        <span>{{ t.taskCheck.errorBlocked }}</span>
      </div>

      <div class="action-row">
        <NButton @click="handleClose">{{ t.taskCheck.cancel }}</NButton>
        <NButton
          type="primary"
          :disabled="!canProceed"
          @click="handleConfirm"
        >
          {{ t.taskCheck.next }}
          <template #icon>
            <ArrowRight class="w-4 h-4" />
          </template>
        </NButton>
      </div>
    </div>
  </NModal>
</template>

<style scoped>
.check-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.check-tip {
  margin: 0;
  padding: 8px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--textSecondary);
}

.check-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.check-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
  transition: border-color 0.2s ease;
}

.check-item.status-error {
  border-color: var(--danger-soft);
  background: var(--danger-soft);
}

.check-item.status-warning {
  border-color: var(--warning-soft);
  background: var(--warning-soft);
}

.check-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.check-body {
  flex: 1;
  min-width: 0;
}

.check-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.check-detail {
  margin-top: 4px;
  font-size: 12px;
  color: var(--textSecondary);
}

.warning-banner,
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
}

.warning-banner {
  background: var(--warning-soft);
  color: var(--warning);
}

.error-banner {
  background: var(--danger-soft);
  color: var(--danger);
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
