<script setup lang="ts">
import { ref } from 'vue'
import { Settings2, ChevronDown, ChevronUp } from 'lucide-vue-next'
import ReferenceTransform from './ReferenceTransform.vue'
import QueryTransform from './QueryTransform.vue'
import { useSequenceStore } from '../../stores/sequence'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const store = useSequenceStore()
const expanded = ref(true)
</script>

<template>
  <section class="preprocess-section">
    <header class="section-header" @click="expanded = !expanded">
      <div class="section-title">
        <div class="section-icon">
          <Settings2 class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold">{{ t.preprocess.title }}</h2>
          <p class="section-subtitle">{{ t.preprocess.subtitle }}</p>
        </div>
      </div>
      <button class="expand-btn">
        <ChevronUp v-if="expanded" class="w-5 h-5" />
        <ChevronDown v-else class="w-5 h-5" />
      </button>
    </header>

    <Transition name="collapse">
      <div v-show="expanded" class="section-body">
        <div class="transform-grid">
          <div class="transform-panel">
            <div class="panel-title-row">
              <span class="panel-badge ref-badge">R</span>
              <span class="panel-label">{{ t.preprocess.reference }}</span>
              <span class="panel-count">{{ store.reference.length }}</span>
            </div>
            <ReferenceTransform />
          </div>

          <div class="transform-panel">
            <div class="panel-title-row">
              <span class="panel-badge query-badge">Q</span>
              <span class="panel-label">{{ t.preprocess.query }}</span>
              <span class="panel-count">{{ store.query.length }}</span>
            </div>
            <QueryTransform />
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.preprocess-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.section-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.2s ease;
  user-select: none;
}

.section-header:hover {
  background: var(--surface);
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
  background: var(--warning-soft);
  color: var(--warning);
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

.expand-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: var(--surface);
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  color: var(--text);
  background: var(--border);
}

.section-body {
  padding: 0 24px 20px;
}

.transform-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.transform-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
}

.panel-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.panel-badge {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
}

.ref-badge {
  background: var(--primary);
}

.query-badge {
  background: var(--success);
}

.panel-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.panel-count {
  margin-left: auto;
  padding: 2px 8px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: var(--textSecondary);
}

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 500px;
}

@media (max-width: 768px) {
  .section-header {
    padding: 14px 16px;
  }

  .section-body {
    padding: 0 16px 16px;
  }

  .transform-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
