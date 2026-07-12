<script setup lang="ts">
import ThemeSwitcher from '../common/ThemeSwitcher.vue'
import { Dna } from 'lucide-vue-next'
import { useI18n } from '../../i18n'

const { t } = useI18n()
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="logo-area">
        <div class="logo-icon">
          <Dna class="w-7 h-7" />
        </div>
        <div class="logo-text">
          <h1 class="app-title">{{ t.appName }}</h1>
          <p class="app-subtitle">{{ t.appSubtitle }}</p>
        </div>
      </div>

      <div class="header-actions">
        <ThemeSwitcher />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 72px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
}

.header-inner {
  max-width: 1600px;
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 4px 12px var(--primary-soft);
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.3px;
}

.app-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--textSecondary);
  font-weight: 400;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .app-header {
    height: 60px;
  }

  .header-inner {
    padding: 0 var(--space-md);
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .logo-icon :deep(svg) {
    width: 22px;
    height: 22px;
  }

  .app-subtitle {
    display: none;
  }

  .app-title {
    font-size: 16px;
  }
}
</style>
