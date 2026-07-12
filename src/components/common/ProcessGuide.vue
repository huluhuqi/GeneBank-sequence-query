<script setup lang="ts">
import { useI18n } from '../../i18n'
import { Info } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <div class="process-guide">
    <div class="guide-header">
      <div class="guide-icon">
        <Info class="w-4 h-4" />
      </div>
      <h3 class="guide-title">{{ t.guide.title }}</h3>
    </div>

    <ol class="guide-steps">
      <li class="guide-step">
        <span class="step-num">1</span>
        <span class="step-text">{{ t.guide.step1 }}</span>
      </li>
      <li class="guide-step">
        <span class="step-num">2</span>
        <span class="step-text">{{ t.guide.step2 }}</span>
      </li>
      <li class="guide-step">
        <span class="step-num">3</span>
        <span class="step-text">{{ t.guide.step3 }}</span>
      </li>
      <li class="guide-step">
        <span class="step-num">4</span>
        <span class="step-text">{{ t.guide.step4 }}</span>
      </li>
    </ol>

    <div class="guide-tip">
      <span class="tip-icon">!</span>
      <span class="tip-text">{{ t.guide.tip }}</span>
    </div>
  </div>
</template>

<style scoped>
.process-guide {
  background: var(--primary-soft);
  border: 1px solid var(--primary-soft);
  border-radius: 14px;
  padding: 16px 20px;
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.guide-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.guide-steps {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.guide-step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 12px;
}

.step-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.step-text {
  color: var(--text);
  font-weight: 500;
  line-height: 1.3;
}

.guide-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: var(--warning-soft);
  border: 1px solid var(--warning-soft);
  border-radius: 8px;
}

.tip-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--warning);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.tip-text {
  font-size: 12px;
  color: var(--warning);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .guide-steps {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .guide-steps {
    grid-template-columns: 1fr;
  }
}
</style>
