<script setup lang="ts">
import { ref, computed } from 'vue'
import { NModal, NInput, NInputNumber, NButton, NSelect } from 'naive-ui'
import { useI18n } from '../../i18n'
import { previewBatchRename } from '../../utils/idGenerator'

const props = defineProps<{
  show: boolean
  count: number
}>()

const emit = defineEmits<{
  'update:show': [val: boolean]
  confirm: [prefix: string, start: number, pad: number]
}>()

const { t } = useI18n()

const prefix = ref('')
const start = ref(1)
const pad = ref(3)

const padOptions = [
  { label: '3 位 (001)', value: 3 },
  { label: '4 位 (0001)', value: 4 },
  { label: '5 位 (00001)', value: 5 },
]

const preview = computed(() =>
  previewBatchRename(props.count, prefix.value || 'Prefix', start.value, pad.value),
)

function handleConfirm() {
  if (!prefix.value.trim()) return
  emit('confirm', prefix.value.trim(), start.value, pad.value)
  handleClose()
}

function handleClose() {
  prefix.value = ''
  start.value = 1
  pad.value = 3
  emit('update:show', false)
}
</script>

<template>
  <NModal
    :show="props.show"
    @update:show="emit('update:show', $event)"
    preset="card"
    :title="t.input.batchRenameTitle"
    style="width: 480px; max-width: 92vw"
    :bordered="false"
  >
    <div class="rename-content">
      <p class="rename-tip">
        {{ t.input.batchRenameTip.replace('{count}', String(count)) }}
      </p>

      <div class="form-row">
        <label class="form-label">{{ t.input.renamePrefix }}</label>
        <NInput
          v-model:value="prefix"
          :placeholder="t.input.renamePrefixPlaceholder"
        />
      </div>

      <div class="form-row form-row-2">
        <div>
          <label class="form-label">{{ t.input.renameStart }}</label>
          <NInputNumber v-model:value="start" :min="1" style="width: 100%" />
        </div>
        <div>
          <label class="form-label">{{ t.input.renamePad }}</label>
          <NSelect v-model:value="pad" :options="padOptions" />
        </div>
      </div>

      <div class="preview-section">
        <div class="preview-label">{{ t.input.renamePreview }}</div>
        <div class="preview-list">
          <div v-for="(id, i) in preview" :key="i" class="preview-item">{{ id }}</div>
          <div v-if="count > preview.length" class="preview-more">...</div>
        </div>
      </div>

      <div class="action-row">
        <NButton @click="handleClose">{{ t.input.cancel }}</NButton>
        <NButton type="primary" :disabled="!prefix.trim()" @click="handleConfirm">
          {{ t.input.confirmRename }}
        </NButton>
      </div>
    </div>
  </NModal>
</template>

<style scoped>
.rename-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rename-tip {
  margin: 0;
  padding: 8px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--textSecondary);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row-2 {
  flex-direction: row;
  gap: 12px;
}

.form-row-2 > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.preview-section {
  padding: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.preview-label {
  font-size: 12px;
  color: var(--textSecondary);
  margin-bottom: 8px;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-item {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 13px;
  color: var(--text);
  padding: 4px 8px;
  background: var(--card);
  border-radius: 4px;
}

.preview-more {
  font-size: 12px;
  color: var(--textSecondary);
  text-align: center;
  padding: 4px;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
