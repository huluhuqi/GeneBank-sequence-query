<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '../../stores/theme'
import { themes } from '../../theme'

const store = useThemeStore()
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function selectTheme(name: string) {
  store.changeTheme(name)
  open.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="rootRef" class="theme">
    <button class="theme-btn" @click="open = !open">
      {{ themes[store.current]?.label || '🎨 Theme' }}
    </button>

    <Transition name="fade">
      <div v-if="open" class="menu">
        <div
          v-for="item in Object.values(themes)"
          :key="item.name"
          class="item"
          :class="{ active: store.current === item.name }"
          @click="selectTheme(item.name)"
        >
          {{ item.label }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.theme {
  position: relative;
}

.theme-btn {
  padding: 6px 14px;
  border-radius: 10px;
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.theme-btn:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}

.menu {
  position: absolute;
  right: 0;
  top: 42px;
  width: 160px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 6px;
  box-shadow: var(--shadow);
  z-index: 100;
}

.item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text);
  transition: background 0.2s ease;
}

.item:hover {
  background: var(--surface);
}

.item.active {
  background: var(--surface);
  color: var(--primary);
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
