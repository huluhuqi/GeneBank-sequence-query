<script setup lang="ts">
import { ref, computed } from 'vue'
import { NDropdown, NButton, NModal, NCheckbox, NProgress, useMessage } from 'naive-ui'
import { Download, ChevronDown } from 'lucide-vue-next'
import { useResultStore } from '../../stores/result'
import { useSequenceStore } from '../../stores/sequence'
import { exportExcel, exportCSV, exportFASTA, exportJSON } from '../../engine/export'
import type { ExportMode, ExportFormat, ExportOption } from '../../types/export'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const resultStore = useResultStore()
const seqStore = useSequenceStore()
const message = useMessage()

const showOptions = ref(false)
const exporting = ref(false)
const exportProgress = ref(0)

const exportMode = ref<ExportMode>('filtered')
const exportOption = ref<ExportOption>({
  includeAlignment: true,
  includeStatistics: true,
  includeOriginalSequence: false,
  onlyBestResult: false,
})

const exportData = computed(() => {
  switch (exportMode.value) {
    case 'all':
      return resultStore.results
    case 'filtered':
      return resultStore.sortedResults
    case 'selected':
      return resultStore.selectedResult ? [resultStore.selectedResult] : []
    case 'best':
      return resultStore.bestResult ? [resultStore.bestResult] : []
    default:
      return resultStore.results
  }
})

const modeLabels: Record<ExportMode, string> = {
  all: t.result.exportOptions.allResults,
  filtered: t.result.exportOptions.currentFilter,
  selected: t.result.exportOptions.selectedOnly,
  best: t.result.exportOptions.bestResult,
}

const dropdownOptions: { label: string; key: string }[] = [
  { label: 'Excel', key: 'excel' },
  { label: 'CSV', key: 'csv' },
  { label: 'FASTA', key: 'fasta' },
  { label: 'JSON', key: 'json' },
]

// 分隔符和额外选项在 NDropdown 中通过 props 处理

async function handleSelect(key: string) {
  if (key === 'options') {
    showOptions.value = true
    return
  }

  const format = key as ExportFormat
  const data = exportData.value

  if (data.length === 0) {
    message.warning('没有可导出的结果')
    return
  }

  if (format === 'fasta') {
    // FASTA 导出序列而非结果
    const seqs = [...seqStore.reference, ...seqStore.query]
    if (seqs.length === 0) {
      message.warning('没有可导出的序列')
      return
    }
    exportFASTA(seqs)
    message.success(`已导出 ${seqs.length} 条序列 (FASTA)`)
    return
  }

  exporting.value = true
  exportProgress.value = 0

  // 模拟进度更新
  const timer = setInterval(() => {
    if (exportProgress.value < 90) {
      exportProgress.value += 10
    }
  }, 50)

  await new Promise((r) => setTimeout(r, 100))

  try {
    const params = {
      results: data,
      references: seqStore.reference,
      queries: seqStore.query,
      option: exportOption.value,
    }

    switch (format) {
      case 'excel':
        exportExcel(params)
        break
      case 'csv':
        exportCSV(data)
        break
      case 'json':
        exportJSON(params)
        break
    }

    exportProgress.value = 100
    message.success(`已导出 ${data.length} 条结果 (${format.toUpperCase()})`)
  } catch (e) {
    message.error(`导出失败: ${e instanceof Error ? e.message : String(e)}`)
  } finally {
    clearInterval(timer)
    setTimeout(() => {
      exporting.value = false
      exportProgress.value = 0
    }, 500)
  }
}

function handleDropdownSelect(key: string) {
  handleSelect(key)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- 导出进度 -->
    <div v-if="exporting" class="flex items-center gap-2">
      <NProgress
        type="line"
        :percentage="exportProgress"
        :height="6"
        :border-radius="3"
        :show-indicator="false"
        style="width: 120px"
      />
      <span class="text-xs" style="color: var(--textSecondary)">导出中...</span>
    </div>

    <!-- 导出按钮 -->
    <div v-else class="flex items-center gap-2">
      <NDropdown
        trigger="click"
        :options="dropdownOptions"
        @select="handleDropdownSelect"
      >
        <NButton type="primary" size="small">
          <template #icon>
            <Download class="w-4 h-4" />
          </template>
          {{ t.result.export }}
          <ChevronDown class="w-3 h-3 ml-1" />
        </NButton>
      </NDropdown>

      <NButton size="small" quaternary @click="showOptions = true">
        {{ t.result.exportOptions.title }}
      </NButton>
    </div>

    <!-- 导出选项弹窗 -->
    <NModal
      v-model:show="showOptions"
      preset="card"
      :title="t.result.exportOptions.title"
      style="width: 420px"
    >
      <div class="space-y-4">
        <div>
          <p class="text-sm font-medium mb-2">{{ t.result.exportOptions.exportRange }}</p>
          <div class="space-y-1">
            <label
              v-for="(label, key) in modeLabels"
              :key="key"
              class="flex items-center gap-2 cursor-pointer text-sm"
            >
              <input
                type="radio"
                :value="key"
                v-model="exportMode"
                class="cursor-pointer"
              >
              {{ label }}
            </label>
          </div>
        </div>

        <div class="border-t pt-3">
          <p class="text-sm font-medium mb-2">{{ t.result.exportOptions.contentOptions }}</p>
          <div class="space-y-2">
            <NCheckbox v-model:checked="exportOption.includeAlignment">
              {{ t.result.exportOptions.includeAlignment }}
            </NCheckbox>
            <NCheckbox v-model:checked="exportOption.includeStatistics">
              {{ t.result.exportOptions.includeStatistics }}
            </NCheckbox>
            <NCheckbox v-model:checked="exportOption.includeOriginalSequence">
              {{ t.result.exportOptions.includeOriginalSequence }}
            </NCheckbox>
          </div>
        </div>

        <div class="border-t pt-3 text-xs" style="color: var(--textSecondary)">
          {{ t.result.exportOptions.currentSelection.replace('{count}', String(exportData.length)) }}
        </div>
      </div>
    </NModal>
  </div>
</template>
