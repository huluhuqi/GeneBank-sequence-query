<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NInput, NCheckbox, NPopconfirm } from 'naive-ui'
import { Search, Trash2, Download, Edit3, CheckSquare } from 'lucide-vue-next'
import { useI18n } from '../../i18n'

const props = defineProps<{
  count: number
  selectedCount: number
  search?: string
}>()

const emit = defineEmits<{
  clear: []
  export: []
  'update:search': [value: string]
  'toggle-select-all': []
  'remove-selected': []
  'batch-rename': []
}>()

const { t } = useI18n()

const allSelected = computed(() => props.count > 0 && props.selectedCount === props.count)
const indeterminate = computed(() => props.selectedCount > 0 && props.selectedCount < props.count)
</script>

<template>
  <div class="sequence-toolbar">
    <div class="toolbar-left">
      <NCheckbox
        v-if="count > 0"
        :checked="allSelected"
        :indeterminate="indeterminate"
        @update:checked="emit('toggle-select-all')"
      />
      <span class="count-text">
        <span class="count-num">{{ count }}</span>
        <span class="count-label">{{ t.input.sequenceCount }}</span>
      </span>
      <span v-if="selectedCount > 0" class="selected-text">
        {{ t.input.selectedCount.replace('{count}', String(selectedCount)) }}
      </span>
    </div>

    <div class="toolbar-right">
      <NInput
        v-if="count > 0"
        :value="search"
        :placeholder="t.input.searchPlaceholder"
        size="small"
        clearable
        style="width: 160px"
        @update:value="emit('update:search', $event)"
      >
        <template #prefix>
          <Search class="w-3.5 h-3.5" style="color: var(--textSecondary)" />
        </template>
      </NInput>

      <NButton
        v-if="count > 0"
        size="small"
        quaternary
        @click="emit('batch-rename')"
      >
        <template #icon>
          <Edit3 class="w-4 h-4" />
        </template>
        {{ t.input.batchRename }}
      </NButton>

      <NButton
        v-if="count > 0"
        size="small"
        quaternary
        @click="emit('export')"
      >
        <template #icon>
          <Download class="w-4 h-4" />
        </template>
        {{ t.input.export }}
      </NButton>

      <NButton
        v-if="selectedCount > 0"
        size="small"
        quaternary
        type="error"
        @click="emit('remove-selected')"
      >
        <template #icon>
          <Trash2 class="w-4 h-4" />
        </template>
        {{ t.input.removeSelected.replace('{count}', String(selectedCount)) }}
      </NButton>

      <NPopconfirm v-if="count > 0" @positive-click="emit('clear')">
        <template #trigger>
          <NButton size="small" quaternary type="error">
            <template #icon>
              <CheckSquare class="w-4 h-4" />
            </template>
            {{ t.input.clearAll }}
          </NButton>
        </template>
        {{ t.input.clearConfirm }}
      </NPopconfirm>
    </div>
  </div>
</template>

<style scoped>
.sequence-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count-text {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.count-num {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}

.count-label {
  font-size: 12px;
  color: var(--textSecondary);
}

.selected-text {
  padding: 2px 8px;
  background: var(--primary-soft);
  color: var(--primary);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .sequence-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .toolbar-right {
    justify-content: space-between;
  }
}
</style>
