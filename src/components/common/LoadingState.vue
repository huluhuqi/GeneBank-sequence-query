<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="loading-state">
    <div class="loading-icon">
      <Loader2 class="w-8 h-8 animate-spin" />
    </div>
    <h3 class="loading-title">{{ title || 'Loading...' }}</h3>
    <p v-if="description" class="loading-desc">{{ description }}</p>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.loading-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  color: var(--primary);
}

.loading-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.loading-desc {
  margin: 0;
  font-size: 13px;
  color: var(--textSecondary);
  max-width: 320px;
  line-height: 1.5;
}
</style>
