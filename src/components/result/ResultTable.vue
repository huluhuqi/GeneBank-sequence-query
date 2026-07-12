<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { NButton } from 'naive-ui'
import { ArrowUp, ArrowDown, BarChart3, Settings2 } from 'lucide-vue-next'
import { useResultStore } from '../../stores/result'
import type { AlignmentResult } from '../../types/alignment'
import ResultFilter from './ResultFilter.vue'
import ResultSummary from './ResultSummary.vue'
import ExportButton from '../export/ExportButton.vue'
import ResultRow from './ResultRow.vue'
import ResultCard from './ResultCard.vue'
import EmptyState from '../common/EmptyState.vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const store = useResultStore()

const results = computed(() => store.sortedResults)
const bestId = computed(() => store.bestResult?.id)
const selectedId = computed(() => store.selectedResult?.id)

const virtualListRef = ref<HTMLElement | null>(null)
const mobileScrollerRef = ref<HTMLElement | null>(null)

const columns = computed<Column[]>(() => [
  { key: 'referenceName', label: t.result.columns.reference, align: 'left', width: '200px', minWidth: '150px', flex: 1 },
  { key: 'queryName', label: t.result.columns.query, align: 'left', width: '200px', minWidth: '150px', flex: 1 },
  { key: 'identity', label: t.result.columns.identity, align: 'right', width: '90px' },
  { key: 'match', label: t.result.columns.match, align: 'right', width: '80px' },
  { key: 'mismatch', label: t.result.columns.mismatch, align: 'right', width: '80px' },
  { key: 'method', label: t.result.columns.method, align: 'left', width: '120px' },
  { key: 'score', label: t.result.columns.score, align: 'right', width: '70px' },
  { key: 'referenceStart', label: t.result.columns.refRange, align: 'right', width: '110px' },
  { key: 'queryStart', label: t.result.columns.queryRange, align: 'right', width: '100px' },
  { key: 'orientation', label: t.result.columns.orientation, align: 'left', width: '130px' },
  { key: 'gap', label: t.result.columns.gap, align: 'right', width: '60px', advanced: true },
])

interface Column {
  key: keyof AlignmentResult
  label: string
  align: 'left' | 'right'
  width: string
  minWidth?: string
  flex?: number
  advanced?: boolean
}

const visibleColumns = computed(() =>
  columns.value.filter((c) => !c.advanced || store.showAdvanced),
)

async function handleSort(field: keyof AlignmentResult) {
  store.toggleSort(field)
  await nextTick()
  virtualListRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
  mobileScrollerRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleSelect(item: AlignmentResult) {
  store.selectResult(item)
}

const totalWidth = computed(() => {
  let w = 40
  for (const col of visibleColumns.value) {
    w += parseInt(col.width)
  }
  return w + 'px'
})
</script>

<template>
  <section class="result-section">
    <header class="section-header">
      <div class="section-title">
        <div class="section-icon">
          <BarChart3 class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold">{{ t.result.title }}</h2>
          <p class="section-subtitle" v-if="results.length > 0">
            {{ t.result.found.replace('{count}', String(results.length)) }}
          </p>
          <p class="section-subtitle" v-else>
            {{ t.result.subtitle }}
          </p>
        </div>
      </div>
      <div class="section-actions" v-if="results.length > 0">
        <NButton size="small" quaternary @click="store.toggleAdvanced()">
          <template #icon>
            <Settings2 class="w-4 h-4" />
          </template>
          {{ store.showAdvanced ? t.result.hideAdvanced : t.result.showAdvanced }}
        </NButton>
        <ExportButton />
      </div>
    </header>

    <div v-if="results.length > 0" class="section-body">
      <!-- 统计概览 -->
      <ResultSummary />

      <!-- 搜索栏 -->
      <div class="toolbar-row">
        <ResultFilter />
      </div>

      <!-- 桌面端：表格 -->
      <div class="desktop-table">
        <div :style="{ minWidth: totalWidth }">
          <!-- 表头 -->
          <div class="table-header">
            <div class="th-index">#</div>
            <div
              v-for="col in visibleColumns"
              :key="String(col.key)"
              class="th-cell"
              :class="col.align === 'right' ? 'text-right' : 'text-left'"
              :style="{ 
                width: col.width, 
                minWidth: col.minWidth,
                flex: col.flex || 'none'
              }"
              @click="handleSort(col.key)"
            >
              <span class="th-content">
                {{ col.label }}
                <ArrowDown
                  v-if="store.sortField === col.key && store.sortOrder === 'desc'"
                  class="w-3 h-3"
                />
                <ArrowUp
                  v-if="store.sortField === col.key && store.sortOrder === 'asc'"
                  class="w-3 h-3"
                />
              </span>
            </div>
          </div>

          <!-- 虚拟滚动列表 -->
          <DynamicScroller
            :items="results"
            :min-item-size="56"
            key-field="id"
            class="virtual-list"
            ref="virtualListRef"
          >
            <template #default="{ item, index, active }">
              <DynamicScrollerItem :item="item" :active="active" :data-index="index">
                <ResultRow
                  :item="item"
                  :index="index"
                  :best-id="bestId"
                  :show-advanced="store.showAdvanced"
                  :selected="selectedId === item.id"
                  @select="handleSelect"
                />
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>
        </div>
      </div>

      <!-- 移动端：卡片列表 -->
      <div class="mobile-cards">
        <DynamicScroller
          :items="results"
          :min-item-size="180"
          key-field="id"
          class="mobile-scroller"
          ref="mobileScrollerRef"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem :item="item" :active="active" :data-index="index">
              <div class="card-wrapper">
                <ResultCard
                  :item="item"
                  :index="index"
                  :best-id="bestId"
                  :show-advanced="store.showAdvanced"
                  :selected="selectedId === item.id"
                  @select="handleSelect"
                />
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-wrap">
      <EmptyState
        :title="t.empty.noResult"
        :description="t.empty.noResultDesc"
      />
    </div>
  </section>
</template>

<style scoped>
.result-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.section-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--success-soft);
  color: var(--success);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--textSecondary);
  font-weight: 400;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-body {
  padding: 16px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar-row {
  display: flex;
  align-items: center;
}

.desktop-table {
  display: block;
  overflow: auto;
  max-height: 500px;
  border: 1px solid var(--border);
  border-radius: 12px;
}

.table-header {
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  height: 40px;
  background: var(--surface);
  border-bottom: 2px solid var(--border);
  font-size: 12px;
  font-weight: 600;
  color: var(--textSecondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.th-index {
  width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.th-cell {
  padding: 0 12px;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease;
}

.th-cell:hover {
  color: var(--text);
}

.th-content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.virtual-list {
  overflow-y: auto;
  height: calc(500px - 40px);
}

.mobile-cards {
  display: none;
}

.mobile-scroller {
  overflow-y: auto;
  max-height: 60vh;
}

.card-wrapper {
  padding: 4px 0;
}

.empty-wrap {
  padding: 32px 24px;
}

@media (max-width: 768px) {
  .section-header {
    padding: 14px 16px;
    flex-wrap: wrap;
  }

  .section-body {
    padding: 12px 16px 16px;
  }

  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .empty-wrap {
    padding: 24px 16px;
  }
}
</style>
