<script setup lang="ts">
import { computed } from 'vue'
import { NInputNumber, NButton, NTag } from 'naive-ui'
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-vue-next'
import { useResultStore } from '../../stores/result'
import type { MethodFilter } from '../../stores/result'
import { useI18n } from '../../i18n'

const store = useResultStore()
const { t } = useI18n()

const methodOptions = computed(() => {
  const opts: { label: string; value: MethodFilter; count: number }[] = [
    { label: t.result.methodAll, value: 'all', count: store.results.length },
  ]
  store.availableMethods.forEach((m) => {
    const count = store.results.filter((r) => r.method === m).length
    let label = m
    if (m === 'Sliding') label = t.result.methodSliding
    else if (m === 'Local') label = t.result.methodLocal
    else if (m === 'Reverse Complement') label = t.result.methodRC
    else if (m === 'SnapGene') label = t.result.methodSnapGene
    opts.push({ label, value: m as MethodFilter, count })
  })
  return opts
})

const hasActiveFilters = computed(
  () =>
    store.keyword !== '' ||
    store.methodFilter !== 'all' ||
    store.minIdentity > 0 ||
    store.maxMismatch >= 0,
)
</script>

<template>
  <div class="result-filter">
    <!-- 第一行：方法切换 + 搜索 -->
    <div class="filter-row">
      <div class="method-tabs">
        <button
          v-for="opt in methodOptions"
          :key="opt.value"
          class="method-tab"
          :class="{ active: store.methodFilter === opt.value }"
          @click="store.setMethodFilter(opt.value)"
        >
          {{ opt.label }}
          <span class="tab-count">{{ opt.count }}</span>
        </button>
      </div>

      <div class="search-box">
        <Search class="search-icon" />
        <input
          :value="store.keyword"
          @input="store.setKeyword(($event.target as HTMLInputElement).value)"
          :placeholder="t.result.searchPlaceholder"
          class="search-input"
        />
        <button
          v-if="store.keyword"
          class="clear-btn"
          @click="store.setKeyword('')"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- 第二行：阈值筛选 -->
    <div class="filter-row threshold-row">
      <div class="threshold-item">
        <SlidersHorizontal class="w-3.5 h-3.5" />
        <span class="threshold-label">{{ t.result.minIdentity }}</span>
        <NInputNumber
          :value="store.minIdentity"
          :min="0"
          :max="100"
          :step="5"
          size="small"
          style="width: 90px"
          @update:value="store.setMinIdentity($event || 0)"
        />
        <span class="threshold-unit">%</span>
      </div>

      <div class="threshold-item">
        <span class="threshold-label">{{ t.result.maxMismatch }}</span>
        <NInputNumber
          :value="store.maxMismatch < 0 ? null : store.maxMismatch"
          :min="0"
          :step="1"
          size="small"
          style="width: 80px"
          :placeholder="t.result.unlimited"
          @update:value="store.setMaxMismatch($event === null ? -1 : $event)"
        />
      </div>

      <NButton
        v-if="hasActiveFilters"
        size="small"
        quaternary
        @click="store.resetFilters()"
      >
        <template #icon>
          <RotateCcw class="w-3.5 h-3.5" />
        </template>
        {{ t.result.resetFilters }}
      </NButton>

      <div class="filter-summary">
        <NTag size="small" :bordered="false" type="primary">
          {{ t.result.showingCount.replace('{shown}', String(store.filteredResults.length)).replace('{total}', String(store.results.length)) }}
        </NTag>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.method-tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.method-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  color: var(--textSecondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.method-tab:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.method-tab.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  background: var(--surface);
  color: var(--textSecondary);
}

.method-tab.active .tab-count {
  /* 活跃 tab 背景为主色，徽章使用半透明卡片色作为玻璃效果 */
  background: var(--primary-soft);
  color: var(--card);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 280px;
  margin-left: auto;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: var(--textSecondary);
}

.search-input {
  width: 100%;
  padding: 6px 28px 6px 30px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  background: var(--card);
  color: var(--text);
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: var(--primary);
}

.clear-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: var(--textSecondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

.threshold-row {
  padding: 8px 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.threshold-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.threshold-label {
  font-size: 12px;
  color: var(--textSecondary);
  white-space: nowrap;
}

.threshold-unit {
  font-size: 12px;
  color: var(--textSecondary);
}

.filter-summary {
  margin-left: auto;
}

@media (max-width: 768px) {
  .search-box {
    max-width: 100%;
    margin-left: 0;
    width: 100%;
  }

  .filter-summary {
    margin-left: 0;
  }
}
</style>
