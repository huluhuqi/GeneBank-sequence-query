<template>
  <div class="grid">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns?: number
}>()
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-lg);
}

@media (max-width: 1024px) {
  .grid {
    gap: var(--space-md);
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
}
</style>
