<script setup lang="ts">
import { ref } from 'vue'
import { Upload, ClipboardPaste } from 'lucide-vue-next'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const emit = defineEmits<{
  files: [files: File[]]
  paste: []
}>()

const isDragOver = ref(false)

function drop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  if (e.dataTransfer) {
    emit('files', Array.from(e.dataTransfer.files))
  }
}

function dragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function dragLeave() {
  isDragOver.value = false
}

function choose(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    emit('files', Array.from(input.files))
    input.value = ''
  }
}
</script>

<template>
  <div
    class="drop-zone border-2 border-dashed rounded-xl cursor-pointer transition-colors"
    :class="isDragOver ? 'drag-active' : 'drag-idle'"
    @drop="drop"
    @dragover="dragOver"
    @dragleave="dragLeave"
  >
    <div class="drop-content">
      <div class="drop-item">
        <Upload class="w-6 h-6" style="color: var(--textSecondary)" />
        <span class="text-sm" style="color: var(--textSecondary)">{{ t.input.dropHere }}</span>
      </div>
      <span class="divider" style="color: var(--textSecondary)">|</span>
      <button
        class="drop-item"
        @click.stop="emit('paste')"
      >
        <ClipboardPaste class="w-6 h-6" style="color: var(--textSecondary)" />
        <span class="text-sm" style="color: var(--textSecondary)">{{ t.input.pasteHint }}</span>
      </button>
    </div>
    <input
      type="file"
      multiple
      webkitdirectory
      accept=".fasta,.fa,.fna,.fas,.txt,.csv,.tsv,.xlsx"
      class="hidden"
      @change="choose"
    >
  </div>
</template>

<style scoped>
.drop-zone {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.drag-active {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.drag-idle {
  border-color: var(--border);
}

.drag-idle:hover {
  border-color: var(--textSecondary);
}

.drop-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.drop-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.divider {
  font-size: 18px;
}

@media (max-width: 768px) {
  .drop-zone {
    min-height: 140px;
  }

  .drop-content {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .drop-zone {
    min-height: 120px;
  }

  .drop-content {
    flex-direction: column;
    gap: 8px;
  }

  .divider {
    display: none;
  }

  .drop-item span {
    font-size: 12px;
  }
}
</style>
