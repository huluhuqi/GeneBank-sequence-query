<script setup lang="ts">
import { ShieldCheck, Cpu } from 'lucide-vue-next'
import { useI18n } from '../../i18n'

const { t } = useI18n()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-left">
        <div class="footer-brand">
          <span class="footer-icon">🧬</span>
          <span class="footer-name">{{ t.appName }}</span>
          <span class="footer-version">{{ t.footer.version }}</span>
        </div>
      </div>

      <div class="footer-right">
        <div class="footer-badge">
          <Cpu class="w-4 h-4" />
          <span>{{ t.footer.localProcessing }}</span>
        </div>
        <div class="footer-badge">
          <ShieldCheck class="w-4 h-4" />
          <span>{{ t.footer.noUpload }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: auto;
  background: var(--card);
  border-top: 1px solid var(--border);
}

.footer-inner {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--textSecondary);
  font-size: 13px;
}

.footer-icon {
  font-size: 18px;
}

.footer-name {
  font-weight: 500;
  color: var(--text);
}

.footer-version {
  padding: 2px 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--textSecondary);
}

@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-md);
    gap: 8px;
  }

  .footer-right {
    flex-wrap: wrap;
    gap: 10px;
  }

  .footer-badge {
    font-size: 11px;
  }
}
</style>
