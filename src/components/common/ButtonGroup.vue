<template>
  <div class="button-group">
    <slot />
  </div>
</template>

<style scoped>
.button-group {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .button-group {
    flex-direction: column;
    width: 100%;
  }

  .button-group > * {
    width: 100%;
  }
}
</style>
