<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="error-state">
    <div class="error-icon">
      <AlertTriangle class="w-8 h-8" />
    </div>
    <h3 class="error-title">{{ title || 'Error' }}</h3>
    <p class="error-desc">{{ description || 'Something went wrong' }}</p>
    <slot name="action" />
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  text-align: center;
  background: var(--danger-soft);
  border: 1px solid var(--danger-soft);
  border-radius: 14px;
}

.error-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--danger-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: var(--danger);
}

.error-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--danger);
}

.error-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--textSecondary);
  max-width: 360px;
  line-height: 1.5;
}
</style>
