<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppContainer from '@/components/layout/AppContainer.vue'
import Footer from '@/components/layout/Footer.vue'
import WelcomeOverlay from '@/components/common/WelcomeOverlay.vue'
import { NMessageProvider, NDialogProvider, NConfigProvider } from 'naive-ui'
import { darkTheme } from 'naive-ui'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import ThemeTransition from '@/components/common/ThemeTransition.vue'

const themeStore = useThemeStore()

const naiveTheme = computed(() => {
  const darkThemes = ['dark', 'midnight']
  return darkThemes.includes(themeStore.current) ? darkTheme : null
})
</script>

<template>
  <NConfigProvider :theme="naiveTheme">
    <NMessageProvider>
      <NDialogProvider>
        <div class="app-shell">
          <AppHeader />
          <div class="app-content">
            <AppContainer>
              <slot />
            </AppContainer>
          </div>
          <Footer />
          <ThemeTransition />
          <WelcomeOverlay />
        </div>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background);
  color: var(--text);
  transition:
    background-color var(--duration-slow) var(--ease-default),
    color var(--duration-slow) var(--ease-default);
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
