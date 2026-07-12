<script setup lang="ts">
import { Dna } from 'lucide-vue-next'
import { useI18n } from '../../i18n'

defineProps<{
  type?: 'reference' | 'query'
}>()

const { t } = useI18n()
</script>

<template>
  <div class="sequence-empty">
    <div class="empty-icon">
      <Dna class="w-10 h-10" />
    </div>
    <h3 class="empty-title">
      {{ type === 'query' ? t.input.queryEmpty : t.input.referenceEmpty }}
    </h3>
    <p class="empty-desc">{{ t.input.emptyHint }}</p>
    <div class="empty-supported">
      <span>{{ t.input.supportFasta }}</span>
      <span>{{ t.input.supportExcel }}</span>
      <span>{{ t.input.supportPaste }}</span>
      <span>{{ t.input.supportDrop }}</span>
    </div>
  </div>
</template>

<style scoped>
.sequence-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  color: var(--textSecondary);
}

.empty-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.empty-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--textSecondary);
}

.empty-supported {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 12px;
  font-size: 11px;
  color: var(--textSecondary);
  max-width: 280px;
}

.empty-supported span::before {
  content: '•';
  margin-right: 4px;
  color: var(--primary);
}
</style>
