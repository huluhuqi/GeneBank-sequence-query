import type { ThemeConfig } from './themes'

// 将主题颜色应用到 CSS 变量
export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement

  // 应用所有 ThemeColors 字段为 --xxx 变量
  Object.entries(theme.colors).forEach(([key, value]) => {
    // 将 camelCase 转为 kebab-case：textSecondary → text-secondary
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    root.style.setProperty(`--${cssKey}`, value)
  })

  // 应用碱基颜色（生物信息视觉编码，跨主题一致）
  root.style.setProperty('--base-a', theme.baseColors.A)
  root.style.setProperty('--base-t', theme.baseColors.T)
  root.style.setProperty('--base-c', theme.baseColors.C)
  root.style.setProperty('--base-g', theme.baseColors.G)
}
