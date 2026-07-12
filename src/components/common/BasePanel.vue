<template>
  <section class="panel">
    <slot />
  </section>
</template>

<style scoped>
.panel {
  background: linear-gradient(145deg, var(--card), var(--surface));
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 24px;
  transition: all 0.3s ease;
}
</style>
