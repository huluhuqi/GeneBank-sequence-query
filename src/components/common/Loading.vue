<template>
  <div class="loader">
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<style scoped>
.loader {
  display: flex;
  gap: 8px;
}

.loader div {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary);
  animation: loading 1s infinite;
}

.loader div:nth-child(2) {
  animation-delay: 0.2s;
}

.loader div:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes loading {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
