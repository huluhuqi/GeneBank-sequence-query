<script setup lang="ts">
defineProps({
  progress: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <div class="bar">
    <div class="value" :style="{ width: progress + '%' }"></div>
  </div>
</template>

<style scoped>
.bar {
  height: 8px;
  background: var(--surface);
  border-radius: 20px;
  overflow: hidden;
}

.value {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transition: width 0.5s ease;
}
</style>
