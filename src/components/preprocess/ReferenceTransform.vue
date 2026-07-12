<script setup lang="ts">
import { NButton } from 'naive-ui'
import { RotateCcw, ArrowLeftRight, FlipHorizontal } from 'lucide-vue-next'
import { useSequenceStore } from '../../stores/sequence'
import { reverseComplement, dnaToRna, rnaToDna } from '../../engine/sequence'
import { calcGC, detectType } from '../../engine/sequence/statistics'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const store = useSequenceStore()

function getItems() {
  return store.reference
}

function reverse() {
  getItems().forEach((item) => {
    const newSeq = reverseComplement(item.sequence)
    item.sequence = newSeq
    item.length = newSeq.length
    item.gc = calcGC(newSeq)
    item.type = detectType(newSeq)
    item.operations.push('Reverse Complement')
  })
}

function toggleRNA() {
  getItems().forEach((item) => {
    let newSeq: string
    if (item.type === 'DNA') {
      newSeq = dnaToRna(item.sequence)
      item.operations.push('DNA to RNA')
    } else {
      newSeq = rnaToDna(item.sequence)
      item.operations.push('RNA to DNA')
    }
    item.sequence = newSeq
    item.length = newSeq.length
    item.gc = calcGC(newSeq)
    item.type = detectType(newSeq)
  })
}

function restore() {
  store.restoreReference()
}
</script>

<template>
  <div>
    <div class="flex items-center gap-2 flex-wrap">
      <NButton size="small" :disabled="getItems().length === 0" @click="reverse">
        <template #icon>
          <FlipHorizontal class="w-4 h-4" />
        </template>
        {{ t.preprocess.reverseComplement }}
      </NButton>

      <NButton size="small" :disabled="getItems().length === 0" @click="toggleRNA">
        <template #icon>
          <ArrowLeftRight class="w-4 h-4" />
        </template>
        {{ t.preprocess.dnaToRna }}
      </NButton>

      <NButton size="small" :disabled="getItems().length === 0" @click="restore">
        <template #icon>
          <RotateCcw class="w-4 h-4" />
        </template>
        {{ t.preprocess.restore }}
      </NButton>
    </div>
  </div>
</template>
