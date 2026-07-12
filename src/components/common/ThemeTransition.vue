<template>
  <Transition name="theme-fade">
    <div v-if="visible" class="theme-transition"></div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useThemeStore } from '../../stores/theme'

const themeStore = useThemeStore()
const visible = ref(false)

watch(
  () => themeStore.current,
  () => {
    visible.value = true
    setTimeout(() => {
      visible.value = false
    }, 400)
  },
)
</script>

<style scoped>
.theme-transition {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: var(--background);
  z-index: 9999;
}

.theme-fade-enter-active {
  animation: themeChange 0.4s var(--ease-default);
}

@keyframes themeChange {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 0;
  }
}
</style>
