<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, Target, TrendingUp, ArrowLeftRight } from 'lucide-vue-next'
import { useResultStore } from '../../stores/result'
import { useI18n } from '../../i18n'

const store = useResultStore()
const { t } = useI18n()

const stats = computed(() => {
  const results = store.results
  if (results.length === 0) return null

  const total = results.length
  const perfectMatches = results.filter((r) => r.identity >= 100).length
  const avgIdentity = Number(
    (results.reduce((sum, r) => sum + r.identity, 0) / total).toFixed(1),
  )
  const rcCount = results.filter(
    (r) => r.orientation === 'Reverse Complement',
  ).length

  return { total, perfectMatches, avgIdentity, rcCount }
})
</script>

<template>
  <div v-if="stats" class="result-summary">
    <div class="stat-card">
      <div class="stat-icon icon-total">
        <Target class="w-4 h-4" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ stats.total }}</span>
        <span class="stat-label">{{ t.result.summaryTotal }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon icon-perfect">
        <CheckCircle2 class="w-4 h-4" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ stats.perfectMatches }}</span>
        <span class="stat-label">{{ t.result.summaryPerfect }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon icon-avg">
        <TrendingUp class="w-4 h-4" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ stats.avgIdentity }}%</span>
        <span class="stat-label">{{ t.result.summaryAvgIdentity }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon icon-rc">
        <ArrowLeftRight class="w-4 h-4" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ stats.rcCount }}</span>
        <span class="stat-label">{{ t.result.summaryRC }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: border-color 0.2s ease;
}

.stat-card:hover {
  border-color: var(--primary);
}

.stat-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-total {
  background: var(--success-soft);
  color: var(--success);
}

.icon-perfect {
  background: var(--warning-soft);
  color: var(--warning);
}

.icon-avg {
  background: var(--primary-soft);
  color: var(--primary);
}

.icon-rc {
  background: var(--primary-soft);
  color: var(--secondary);
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.stat-num {
  font-size: 18px;
  font-weight: 700;
  font-family: 'JetBrains Mono', Consolas, monospace;
  color: var(--text);
  line-height: 1.2;
}

.stat-label {
  font-size: 11px;
  color: var(--textSecondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {
  .result-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
