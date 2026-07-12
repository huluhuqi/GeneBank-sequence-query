<script setup lang="ts">
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'
import { useI18n } from '../../i18n'
import type { AlignmentResult } from '../../types/alignment'

const props = defineProps<{
  item: AlignmentResult
  index: number
  bestId: string | undefined
  showAdvanced: boolean
  selected: boolean
}>()

const emit = defineEmits<{
  select: [item: AlignmentResult]
}>()

const { t } = useI18n()

function identityColor(val: number): string {
  if (val >= 80) return 'var(--success)'
  if (val >= 50) return 'var(--warning)'
  return 'var(--danger)'
}

function methodStyle(method: string): Record<string, string> {
  const colorMap: Record<string, string> = {
    Sliding: 'var(--info)',
    Local: 'var(--success)',
    SnapGene: 'var(--warning)',
    'Reverse Complement': 'var(--primary)',
  }
  const color = colorMap[method] ?? 'var(--primary)'
  return {
    color,
    background: `color-mix(in srgb, ${color} 15%, transparent)`,
  }
}

function translateMethod(method: string): string {
  if (method === 'Sliding') return t.result.methodSliding
  if (method === 'Local') return t.result.methodLocal
  if (method === 'Reverse Complement') return t.result.methodRC
  if (method === 'SnapGene') return t.result.methodSnapGene
  return method
}

// 优先显示 ID，回退到 name
const refDisplay = computed(() => props.item.referenceId || props.item.referenceName)
const queryDisplay = computed(() => props.item.queryId || props.item.queryName)
</script>

<template>
  <div
    class="result-row"
    :class="{ 'is-selected': selected }"
    @click="emit('select', item)"
  >
    <div class="cell-index">
      <Star
        v-if="bestId === item.id"
        class="w-3 h-3 star-icon"
      />
      {{ index + 1 }}
    </div>
    <div class="cell-ref" :title="refDisplay">{{ refDisplay }}</div>
    <div class="cell-query" :title="queryDisplay">{{ queryDisplay }}</div>
    <div class="cell-identity" :style="{ color: identityColor(item.identity) }">
      {{ item.identity }}%
    </div>
    <div class="cell-match">{{ item.match }}</div>
    <div class="cell-mismatch" :class="{ 'has-mismatch': item.mismatch > 0 }">{{ item.mismatch }}</div>
    <div class="cell-method">
      <span class="method-tag" :style="methodStyle(item.method)">{{ translateMethod(item.method) }}</span>
    </div>
    <div class="cell-score">{{ item.score }}</div>
    <div class="cell-ref-range">{{ (item.referenceStart ?? '-') }}-{{ (item.referenceEnd ?? '-') }}</div>
    <div class="cell-query-range">{{ (item.queryStart ?? '-') }}-{{ (item.queryEnd ?? '-') }}</div>
    <div class="cell-orientation">{{ item.orientation ?? '-' }}</div>

    <template v-if="showAdvanced">
      <div class="cell-advanced">{{ item.gap }}</div>
    </template>
  </div>
</template>

<style scoped>
.result-row {
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s ease;
  min-height: 40px;
  padding: 8px 0;
}

.result-row:hover {
  background: var(--surface);
}

.result-row.is-selected {
  background: var(--primary-soft);
}

.cell-index {
  width: 40px;
  text-align: center;
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
}

.star-icon {
  color: var(--warning);
  fill: var(--warning);
}

.cell-ref,
.cell-query {
  min-width: 150px;
  width: 200px;
  padding: 0 12px;
  overflow: hidden;
  color: var(--text);
  font-weight: 500;
  flex: 1;
  word-break: break-all;
  line-height: 1.4;
}

.cell-identity {
  width: 90px;
  padding: 0 12px;
  text-align: right;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 600;
}

.cell-match,
.cell-mismatch,
.cell-score {
  text-align: right;
  font-family: 'JetBrains Mono', Consolas, monospace;
  padding: 0 12px;
}

.cell-match {
  width: 70px;
}

.cell-mismatch {
  width: 80px;
}

.cell-mismatch.has-mismatch {
  color: var(--danger);
  font-weight: 600;
}

.cell-method {
  width: 130px;
  padding: 0 12px;
}

.method-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.cell-score {
  width: 70px;
}

.cell-advanced {
  width: 100px;
  text-align: right;
  padding: 0 12px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  color: var(--textSecondary);
}

.cell-advanced:last-child {
  width: 60px;
}

.cell-ref-range {
  width: 110px;
  text-align: right;
  padding: 0 12px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  color: var(--text);
  font-weight: 500;
}

.cell-query-range {
  width: 100px;
  text-align: right;
  padding: 0 12px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  color: var(--textSecondary);
}

.cell-orientation {
  width: 130px;
  padding: 0 12px;
  font-size: 12px;
  color: var(--textSecondary);
  text-transform: capitalize;
}
</style>
