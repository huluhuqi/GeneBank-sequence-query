<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Dna, X, Check } from 'lucide-vue-next'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const show = ref(false)

const STORAGE_KEY = 'sat-welcome-shown'

onMounted(() => {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      show.value = true
    }
  } catch {
    show.value = true
  }
})

function dismiss() {
  show.value = false
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // ignore
  }
}

const features = [
  '批量序列比对',
  'FASTA 导入',
  'Excel 批量输入',
  '反向互补分析',
  '多主题切换',
  '本地浏览器处理',
]
</script>

<template>
  <Transition name="welcome-fade">
    <div v-if="show" class="welcome-overlay" @click.self="dismiss">
      <div class="welcome-card">
        <button class="close-btn" @click="dismiss">
          <X class="w-5 h-5" />
        </button>

        <div class="welcome-icon">
          <Dna class="w-12 h-12" />
        </div>

        <h2 class="welcome-title">{{ t.guide.welcome }}</h2>
        <p class="welcome-desc">{{ t.guide.welcomeDesc }}</p>

        <div class="features-grid">
          <div v-for="(feat, i) in features" :key="i" class="feature-item">
            <Check class="w-4 h-4" />
            <span>{{ feat }}</span>
          </div>
        </div>

        <button class="start-btn" @click="dismiss">
          {{ t.guide.start }}
          <span class="arrow">→</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.welcome-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.welcome-card {
  position: relative;
  max-width: 480px;
  width: 100%;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 40px 32px 32px;
  text-align: center;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: var(--surface);
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: var(--text);
  background: var(--border);
}

.welcome-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 8px 24px var(--primary-soft);
}

.welcome-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.welcome-desc {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--textSecondary);
  line-height: 1.5;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 28px;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
}

.feature-item svg {
  color: var(--success);
  flex-shrink: 0;
}

.start-btn {
  width: 100%;
  padding: 14px 24px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px var(--primary-soft);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--primary-soft);
}

.start-btn:active {
  transform: scale(0.98);
}

.arrow {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.start-btn:hover .arrow {
  transform: translateX(4px);
}

.welcome-fade-enter-active,
.welcome-fade-leave-active {
  transition: opacity 0.3s ease;
}

.welcome-fade-enter-active .welcome-card,
.welcome-fade-leave-active .welcome-card {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.welcome-fade-enter-from,
.welcome-fade-leave-to {
  opacity: 0;
}

.welcome-fade-enter-from .welcome-card,
.welcome-fade-leave-to .welcome-card {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

@media (max-width: 480px) {
  .welcome-card {
    padding: 32px 20px 24px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
