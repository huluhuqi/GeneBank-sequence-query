<script setup lang="ts">
import { Dna } from 'lucide-vue-next'
import { useI18n } from '../../i18n'

const { t } = useI18n()

defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon">
      <Dna class="w-10 h-10" />
    </div>
    <h3 class="empty-title">{{ title || t.empty.noData }}</h3>
    <p class="empty-desc">{{ description || t.empty.noDataDesc }}</p>
    <slot name="action" />
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--textSecondary);
}

.empty-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.empty-desc {
  margin: 0 0 20px;
  font-size: 14px;
  color: var(--textSecondary);
  max-width: 320px;
  line-height: 1.5;
}
</style>
