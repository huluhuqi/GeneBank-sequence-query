<script setup lang="ts">
import { computed } from 'vue'
import { useResultStore } from '../../stores/result'
import { useI18n } from '../../i18n'

const store = useResultStore()
const { t } = useI18n()

const item = computed(() => store.selectedResult)

function translateMethod(method: string): string {
  if (method === 'Sliding') return t.result.methodSliding
  if (method === 'Local') return t.result.methodLocal
  if (method === 'Reverse Complement') return t.result.methodRC
  if (method === 'SnapGene') return t.result.methodSnapGene
  return method
}
</script>

<template>
  <div v-if="item" class="result-detail">
    <h3 class="detail-title">{{ t.result.viewerTitle }}</h3>

    <div class="detail-grid">
      <div class="detail-row">
        <span class="detail-label">{{ t.result.referenceLabel }}</span>
        <span class="detail-value">{{ item.referenceName }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">{{ t.result.queryLabel }}</span>
        <span class="detail-value">{{ item.queryName }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">{{ t.result.methodLabel }}</span>
        <span class="detail-value">{{ translateMethod(item.method) }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">{{ t.result.identityLabel }}</span>
        <span class="detail-value detail-value-bold">{{ item.identity }}%</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">{{ t.result.matchLabel }}</span>
        <span class="detail-value">{{ item.match }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">{{ t.result.mismatchLabel }}</span>
        <span class="detail-value">{{ item.mismatch }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">{{ t.result.columns.gap }}</span>
        <span class="detail-value">{{ item.gap }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">{{ t.result.scoreLabel }}</span>
        <span class="detail-value">{{ item.score }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">{{ t.result.refRangeLabel }}</span>
        <span class="detail-value">{{ (item.referenceStart ?? '-') }} - {{ (item.referenceEnd ?? '-') }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">{{ t.result.columns.queryRange }}</span>
        <span class="detail-value">{{ (item.queryStart ?? '-') }} - {{ (item.queryEnd ?? '-') }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">{{ t.result.columns.orientation }}</span>
        <span class="detail-value">{{ item.orientation ?? '-' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-detail {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
}

.detail-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.detail-label {
  color: var(--textSecondary);
  font-weight: 500;
}

.detail-value {
  color: var(--text);
  font-weight: 600;
  font-family: 'JetBrains Mono', Consolas, monospace;
}

.detail-value-bold {
  font-weight: 700;
}
</style>
