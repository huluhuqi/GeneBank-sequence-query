<script setup lang="ts">
defineProps({
  disabled: Boolean,
})
</script>

<template>
  <button class="base-button" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  position: relative;
  overflow: hidden;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  color: white;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  transition: all 0.25s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

/* 光泽扫过效果 */
.base-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: rgba(255, 255, 255, 0.25);
  transform: skewX(-25deg);
  transition: left 0.5s;
}

.base-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.base-button:hover::before {
  left: 150%;
}

.base-button:active {
  transform: scale(0.95);
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
