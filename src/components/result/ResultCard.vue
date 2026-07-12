<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import type { AlignmentResult } from '../../types/alignment'

defineProps<{
  item: AlignmentResult
  index: number
  bestId?: string
  showAdvanced?: boolean
  selected?: boolean
}>()

const emit = defineEmits<{
  select: [item: AlignmentResult]
}>()

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
</script>

<template>
  <div
    class="result-card"
    :class="{ selected: selected }"
    @click="emit('select', item)"
  >
    <div class="card-header">
      <div class="card-index">
        <Star v-if="bestId === item.id" class="w-3.5 h-3.5" style="color: var(--warning); fill: var(--warning)" />
        <span>{{ index + 1 }}</span>
      </div>
      <span class="method-tag" :style="methodStyle(item.method)">
        {{ item.method }}
      </span>
    </div>

    <div class="card-row">
      <span class="label">Reference</span>
      <span class="value" :title="item.referenceName">{{ item.referenceName }}</span>
    </div>

    <div class="card-row">
      <span class="label">Query</span>
      <span class="value" :title="item.queryName">{{ item.queryName }}</span>
    </div>

    <div class="card-grid">
      <div class="stat">
        <span class="stat-label">Identity</span>
        <span class="stat-value" :style="{ color: identityColor(item.identity) }">
          {{ item.identity }}%
        </span>
      </div>
      <div class="stat">
        <span class="stat-label">Score</span>
        <span class="stat-value">{{ item.score }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Match</span>
        <span class="stat-value">{{ item.match }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Mismatch</span>
        <span class="stat-value">{{ item.mismatch }}</span>
      </div>
    </div>

    <div class="card-grid">
      <div class="stat">
        <span class="stat-label">Reference</span>
        <span class="stat-value">{{ (item.referenceStart ?? '-') }}-{{ (item.referenceEnd ?? '-') }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Query</span>
        <span class="stat-value">{{ (item.queryStart ?? '-') }}-{{ (item.queryEnd ?? '-') }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Orientation</span>
        <span class="stat-value">{{ item.orientation ?? '-' }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Gap</span>
        <span class="stat-value">{{ item.gap }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-card:hover {
  background: var(--surface);
}

.result-card.selected {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 8%, var(--card));
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.card-index {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--textSecondary);
}

.method-tag {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
  gap: 12px;
}

.label {
  color: var(--textSecondary);
  flex-shrink: 0;
}

.value {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  color: var(--text);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  color: var(--textSecondary);
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  font-family: monospace;
  color: var(--text);
}
</style>
