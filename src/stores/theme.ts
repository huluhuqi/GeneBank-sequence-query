import { defineStore } from 'pinia'
import { themes, applyTheme } from '../theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    current: 'light' as string,
    initialized: false,
  }),

  actions: {
    init() {
      if (this.initialized) return

      const saved = localStorage.getItem('sequence-theme')

      if (saved && themes[saved]) {
        this.current = saved
      } else {
        this.current = this.getSystemTheme()
      }

      this.apply()
      this.initialized = true
    },

    changeTheme(name: string) {
      if (!themes[name]) return

      this.current = name
      this.apply()
      localStorage.setItem('sequence-theme', name)
    },

    apply() {
      applyTheme(themes[this.current])
    },

    getSystemTheme(): string {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return dark ? 'dark' : 'light'
    },

    watchSystem() {
      const media = window.matchMedia('(prefers-color-scheme: dark)')

      media.addEventListener('change', (e) => {
        // 用户已手动设置主题则不跟随系统
        if (localStorage.getItem('sequence-theme')) return

        this.changeTheme(e.matches ? 'dark' : 'light')
      })
    },
  },
})
