<script setup lang="ts">
import { CheckCircle } from 'lucide-vue-next'

defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="success-state">
    <div class="success-icon">
      <CheckCircle class="w-8 h-8" />
    </div>
    <h3 class="success-title">{{ title || 'Success' }}</h3>
    <p v-if="description" class="success-desc">{{ description }}</p>
    <slot name="action" />
  </div>
</template>

<style scoped>
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  text-align: center;
  background: var(--success-soft);
  border: 1px solid var(--success-soft);
  border-radius: 14px;
}

.success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--success-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: var(--success);
}

.success-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--success);
}

.success-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--textSecondary);
  max-width: 360px;
  line-height: 1.5;
}
</style>
