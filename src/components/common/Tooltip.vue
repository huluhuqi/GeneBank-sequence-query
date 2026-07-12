<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  text: string
}>()

const show = ref(false)
</script>

<template>
  <span
    class="tooltip-wrapper"
    @mouseenter="show = true"
    @mouseleave="show = false"
  >
    <span class="tooltip-trigger">
      <slot>
        <svg class="info-icon" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a1 1 0 110 2 1 1 0 010-2zm1 8H7V7h2v5z" />
        </svg>
      </slot>
    </span>
    <Transition name="tooltip-fade">
    <span v-if="show" class="tooltip-bubble">
      {{ text }}
    </span>
    </Transition>
  </span>
</template>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.tooltip-trigger {
  display: inline-flex;
  align-items: center;
  cursor: help;
  color: var(--textSecondary);
}

.info-icon {
  width: 14px;
  height: 14px;
}

.tooltip-bubble {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--text);
  color: var(--background);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
  white-space: normal;
  width: max-content;
  max-width: 280px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

.tooltip-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--card);
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}
</style>
