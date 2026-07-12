// 主题配置：统一管理所有颜色变量
// 层级结构：background (页面) → surface (次级) → card (模块) → input (输入框) → hover (悬浮)

/** 碱基颜色（生物信息视觉编码，跨主题保持一致） */
export interface BaseColors {
  A: string
  T: string
  C: string
  G: string
}

export interface ThemeColors {
  /** 主色 */
  primary: string
  primaryHover: string
  secondary: string

  /** 页面背景（最底层） */
  background: string
  /** 次级表面（区域背景、表格条纹） */
  surface: string
  /** 模块/卡片背景（主要容器） */
  card: string
  /** 输入框背景（比 card 更深一层，保证可见） */
  input: string
  /** 悬浮态背景（按钮 hover、列表项 hover） */
  hover: string

  /** 主文字 */
  text: string
  /** 次级文字 */
  textSecondary: string
  /** 静默文字（提示、占位） */
  textMuted: string

  /** 边框 */
  border: string
  /** 浅色边框（分割线） */
  borderLight: string

  /** 状态色 */
  success: string
  warning: string
  danger: string
  info: string

  /** 半透明背景（标签底色、悬浮高亮） */
  primarySoft: string
  successSoft: string
  warningSoft: string
  dangerSoft: string

  /** 阴影 */
  shadow: string
}

export interface ThemeConfig {
  name: string
  label: string
  colors: ThemeColors
  /** 碱基颜色（生物信息视觉编码） */
  baseColors: BaseColors
}

/** 碱基颜色（A/T/C/G 视觉编码，所有主题保持一致） */
const DEFAULT_BASE_COLORS: BaseColors = {
  A: '#22c55e',
  T: '#ef4444',
  C: '#3b82f6',
  G: '#eab308',
}

export const themes: Record<string, ThemeConfig> = {
  light: {
    name: 'light',
    label: '☀ 浅色主题',
    colors: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      secondary: '#60a5fa',

      // 层次：#eef2f7 → #e9eef5 → #ffffff → #f4f6f9 → #eef4ff
      background: '#eef2f7',
      surface: '#e9eef5',
      card: '#ffffff',
      input: '#f4f6f9',
      hover: '#eef4ff',

      text: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',

      border: '#cbd5e1',
      borderLight: '#e2e8f0',

      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#0284c7',

      primarySoft: 'rgba(37, 99, 235, 0.12)',
      successSoft: 'rgba(22, 163, 74, 0.12)',
      warningSoft: 'rgba(217, 119, 6, 0.12)',
      dangerSoft: 'rgba(220, 38, 38, 0.12)',

      shadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
    },
    baseColors: DEFAULT_BASE_COLORS,
  },

  dark: {
    name: 'dark',
    label: '🌙 深色主题',
    colors: {
      primary: '#60a5fa',
      primaryHover: '#93c5fd',
      secondary: '#3b82f6',

      // 层次：#0b1220 → #131c2e → #1e293b → #283548 → #334155
      background: '#0b1220',
      surface: '#131c2e',
      card: '#1e293b',
      input: '#283548',
      hover: '#334155',

      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',

      border: '#3b4859',
      borderLight: '#283548',

      success: '#4ade80',
      warning: '#facc15',
      danger: '#f87171',
      info: '#38bdf8',

      primarySoft: 'rgba(96, 165, 250, 0.15)',
      successSoft: 'rgba(74, 222, 128, 0.15)',
      warningSoft: 'rgba(250, 204, 21, 0.15)',
      dangerSoft: 'rgba(248, 113, 113, 0.15)',

      shadow: '0 4px 20px rgba(0, 0, 0, 0.45)',
    },
    baseColors: DEFAULT_BASE_COLORS,
  },

  ocean: {
    name: 'ocean',
    label: '🌊 海洋主题',
    colors: {
      primary: '#0891b2',
      primaryHover: '#0e7490',
      secondary: '#22d3ee',

      // 层次：#cffafe → #a5f3fc → #ffffff → #ecfeff → #d3f7fb
      background: '#cffafe',
      surface: '#a5f3fc',
      card: '#ffffff',
      input: '#ecfeff',
      hover: '#d3f7fb',

      text: '#0c4a6e',
      textSecondary: '#155e75',
      textMuted: '#0e7490',

      border: '#67e8f9',
      borderLight: '#a5f3fc',

      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#0891b2',

      primarySoft: 'rgba(8, 145, 178, 0.12)',
      successSoft: 'rgba(22, 163, 74, 0.12)',
      warningSoft: 'rgba(217, 119, 6, 0.12)',
      dangerSoft: 'rgba(220, 38, 38, 0.12)',

      shadow: '0 4px 16px rgba(8, 145, 178, 0.18)',
    },
    baseColors: DEFAULT_BASE_COLORS,
  },

  forest: {
    name: 'forest',
    label: '🌲 森林主题',
    colors: {
      primary: '#16a34a',
      primaryHover: '#15803d',
      secondary: '#4ade80',

      // 层次：#dcfce7 → #bbf7d0 → #ffffff → #f0fdf4 → #dcfce7
      background: '#dcfce7',
      surface: '#bbf7d0',
      card: '#ffffff',
      input: '#f0fdf4',
      hover: '#dcfce7',

      text: '#14532d',
      textSecondary: '#3f6212',
      textMuted: '#65a30d',

      border: '#86efac',
      borderLight: '#bbf7d0',

      success: '#16a34a',
      warning: '#ca8a04',
      danger: '#dc2626',
      info: '#0891b2',

      primarySoft: 'rgba(22, 163, 74, 0.12)',
      successSoft: 'rgba(22, 163, 74, 0.12)',
      warningSoft: 'rgba(202, 138, 4, 0.12)',
      dangerSoft: 'rgba(220, 38, 38, 0.12)',

      shadow: '0 4px 16px rgba(22, 163, 74, 0.18)',
    },
    baseColors: DEFAULT_BASE_COLORS,
  },

  midnight: {
    name: 'midnight',
    label: '🌌 深夜主题',
    colors: {
      primary: '#818cf8',
      primaryHover: '#a5b4fc',
      secondary: '#c084fc',

      // 层次：#020617 → #0f1228 → #1e1b4b → #2a2660 → #312e81
      background: '#020617',
      surface: '#0f1228',
      card: '#1e1b4b',
      input: '#2a2660',
      hover: '#312e81',

      text: '#e0e7ff',
      textSecondary: '#a5b4fc',
      textMuted: '#6366f1',

      border: '#4338ca',
      borderLight: '#2a2660',

      success: '#34d399',
      warning: '#fbbf24',
      danger: '#fb7185',
      info: '#60a5fa',

      primarySoft: 'rgba(129, 140, 248, 0.15)',
      successSoft: 'rgba(52, 211, 153, 0.15)',
      warningSoft: 'rgba(251, 191, 36, 0.15)',
      dangerSoft: 'rgba(251, 113, 133, 0.15)',

      shadow: '0 4px 20px rgba(129, 140, 248, 0.3)',
    },
    baseColors: DEFAULT_BASE_COLORS,
  },
}
