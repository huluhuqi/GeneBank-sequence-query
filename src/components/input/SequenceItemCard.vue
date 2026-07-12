<script setup lang="ts">
import { ref, computed } from 'vue'
import { NCheckbox } from 'naive-ui'
import { GripVertical, Trash2, FileText, ClipboardPaste, Pencil, ChevronDown, ChevronUp } from 'lucide-vue-next'
import type { SequenceItem } from '../../types/sequence'
import { useI18n } from '../../i18n'

const props = defineProps<{
  item: SequenceItem
  index: number
  selected?: boolean
  showSelect?: boolean
}>()

const emit = defineEmits<{
  remove: [id: string]
  select: [id: string]
  toggleSelect: [id: string]
}>()

const { t } = useI18n()

const expanded = ref(false)
const PREVIEW_LEN = 80

const isLong = computed(() => props.item.sequence.length > PREVIEW_LEN)

const displaySequence = computed(() =>
  isLong.value && !expanded.value
    ? props.item.sequence.slice(0, PREVIEW_LEN) + '...'
    : props.item.sequence,
)

const sourceInfo = computed(() => {
  switch (props.item.source) {
    case 'file':
      return { icon: FileText, label: t.input.sourceFile }
    case 'paste':
      return { icon: ClipboardPaste, label: t.input.sourcePaste }
    case 'manual':
      return { icon: Pencil, label: t.input.sourceManual }
    default:
      return { icon: FileText, label: props.item.source }
  }
})

function onCheckboxUpdate() {
  emit('toggleSelect', props.item.id)
}
</script>

<template>
  <div
    class="sequence-card"
    :class="{ 'is-selected': selected }"
    draggable="true"
    @click="emit('select', item.id)"
  >
    <div class="card-top">
      <NCheckbox
        v-if="showSelect"
        :checked="selected"
        @update:checked="onCheckboxUpdate"
        @click.stop
        class="select-checkbox"
      />
      <div class="drag-handle">
        <GripVertical class="w-4 h-4" />
      </div>
    </div>

    <div class="card-content">
      <!-- Header：序号 + ID + 删除 -->
      <div class="card-header">
        <div class="header-left">
          <span class="seq-index">{{ String(index + 1).padStart(3, '0') }}</span>
          <span class="seq-id">{{ item.id }}</span>
        </div>
        <button class="remove-btn" @click.stop="emit('remove', item.id)">
          <Trash2 class="w-4 h-4" />
        </button>
      </div>

      <!-- 序列内容（支持折叠） -->
      <div class="seq-text">
        <span class="seq-content">{{ displaySequence }}</span>
        <button
          v-if="isLong"
          class="expand-btn"
          @click.stop="expanded = !expanded"
        >
          <component :is="expanded ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
          {{ expanded ? t.input.collapse : t.input.expand }}
        </button>
      </div>

      <!-- 元信息 -->
      <div class="seq-meta">
        <span class="meta-item">
          <span class="meta-label">{{ t.input.lengthLabel }}</span>
          <span class="meta-value">{{ item.length }} bp</span>
        </span>
        <span class="meta-item">
          <span class="meta-label">{{ t.input.sourceLabel }}</span>
          <span class="meta-value source-tag">
            <component :is="sourceInfo.icon" class="w-3 h-3" />
            {{ sourceInfo.label }}
          </span>
        </span>
        <span v-if="item.fileName" class="meta-item">
          <span class="meta-label">{{ t.input.fileNameLabel }}</span>
          <span class="meta-value file-name" :title="item.fileName">{{ item.fileName }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sequence-card {
  display: flex;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: var(--card);
  border: 1px solid var(--border);
  transition: all 0.25s ease;
  cursor: pointer;
}

.sequence-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
  border-color: var(--textSecondary);
}

.sequence-card.is-selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-soft);
}

.card-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.select-checkbox {
  margin: 0;
}

.drag-handle {
  cursor: grab;
  display: flex;
  align-items: flex-start;
  padding-top: 4px;
  color: var(--textSecondary);
}

.drag-handle:active {
  cursor: grabbing;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.seq-index {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.seq-id {
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  color: var(--danger);
  background: var(--danger-soft);
}

.seq-text {
  margin-top: 10px;
  padding: 10px 12px;
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 13px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  word-break: break-all;
  color: var(--text);
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.seq-content {
  flex: 1;
  min-width: 0;
}

.expand-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--card);
  color: var(--textSecondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  color: var(--primary);
  border-color: var(--primary);
}

.seq-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--textSecondary);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-label {
  color: var(--textSecondary);
}

.meta-value {
  color: var(--text);
  font-weight: 500;
}

.source-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
}

.file-name {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .sequence-card {
    padding: 12px;
  }

  .seq-meta {
    gap: 10px;
  }

  .file-name {
    max-width: 100px;
  }
}
</style>
