<template>
  <Transition name="module" appear>
    <slot />
  </Transition>
</template>

<style scoped>
.module-enter-active,
.module-leave-active {
  transition:
    opacity 0.4s var(--ease-smooth),
    transform 0.4s var(--ease-smooth);
}

.module-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
}

.module-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
