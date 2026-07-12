<template>
  <div class="collapse-panel">
    <button class="header" @click="toggle">
      <span class="title">
        <slot name="title">{{ title }}</slot>
        <span v-if="count !== undefined" class="count">{{ count }}</span>
      </span>
      <span class="arrow" :class="{ open: isOpen }">▼</span>
    </button>
    <Transition name="collapse">
      <div v-if="isOpen" class="content">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title?: string
  count?: number
  defaultOpen?: boolean
  breakpoint?: number
}>()

const isOpen = ref(props.defaultOpen ?? true)

function toggle() {
  isOpen.value = !isOpen.value
}

// 在小屏幕下默认折叠，大屏幕默认展开
function checkBreakpoint() {
  if (props.breakpoint !== undefined) {
    if (typeof window !== 'undefined') {
      isOpen.value = window.innerWidth >= props.breakpoint
    }
  }
}

if (props.breakpoint !== undefined) {
  checkBreakpoint()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', checkBreakpoint)
  }
}
</script>

<style scoped>
.collapse-panel {
  width: 100%;
}

.header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.count {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--surface);
  color: var(--textSecondary);
  font-size: 12px;
  font-weight: 500;
}

.arrow {
  transition: transform 0.3s ease;
  font-size: 12px;
  color: var(--textSecondary);
}

.arrow.open {
  transform: rotate(180deg);
}

.content {
  overflow: hidden;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 2000px;
}
</style>
