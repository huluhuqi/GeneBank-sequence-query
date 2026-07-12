<template>
  <div class="app-container">
    <slot />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--space-lg);
}

@media (max-width: 1024px) {
  .app-container {
    max-width: 100%;
    padding: var(--space-md);
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: var(--space-md);
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: var(--space-sm);
  }
}
</style>
