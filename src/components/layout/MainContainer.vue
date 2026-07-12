<template>
  <main class="container">
    <slot />
  </main>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--space-lg);
}

@media (max-width: 768px) {
  .container {
    padding: var(--space-md);
  }
}

@media (max-width: 480px) {
  .container {
    padding: var(--space-sm);
  }
}
</style>
