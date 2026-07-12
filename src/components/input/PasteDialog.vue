<script setup lang="ts">
import { ref } from 'vue'
import { NModal, NButton, NInput } from 'naive-ui'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [val: boolean]
  parse: [text: string]
}>()

const pasteText = ref('')

function handleConfirm() {
  if (pasteText.value.trim()) {
    emit('parse', pasteText.value)
  }
  pasteText.value = ''
  emit('update:show', false)
}

function handleClose() {
  pasteText.value = ''
  emit('update:show', false)
}
</script>

<template>
  <NModal
    :show="props.show"
    @update:show="emit('update:show', $event)"
    preset="card"
    title="粘贴序列"
    style="width: 600px"
    :bordered="false"
  >
    <div class="space-y-3">
      <p class="text-sm" style="color: var(--textSecondary)">
        支持 FASTA、Excel（含 Tab）、纯文本格式。直接 Ctrl+V 粘贴即可。
      </p>
      <NInput
        v-model:value="pasteText"
        type="textarea"
        placeholder=">Sequence_1\nATCGGCA\n>Sequence_2\nGGCAATCG"
        :rows="10"
      />
      <div class="flex justify-end gap-2">
        <NButton @click="handleClose">取消</NButton>
        <NButton type="primary" @click="handleConfirm">确认导入</NButton>
      </div>
    </div>
  </NModal>
</template>
