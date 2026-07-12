import { reactive, computed } from 'vue'
import zhCN from './zh-CN'
import enUS from './en-US'

export type Locale = 'zh-CN' | 'en-US'

const state = reactive({
  locale: 'zh-CN' as Locale,
  messages: { ...zhCN } as typeof zhCN,
})

function setLocale(locale: Locale) {
  state.locale = locale
  const next = locale === 'zh-CN' ? zhCN : enUS
  // Update messages in place to preserve the reactive reference
  const target = state.messages as Record<string, unknown>
  for (const key of Object.keys(target)) {
    delete target[key]
  }
  Object.assign(target, next)
}

function getLocale(): Locale {
  return state.locale
}

export function useI18n() {
  return {
    t: state.messages,
    locale: computed(() => state.locale),
    setLocale,
    getLocale,
  }
}

export { zhCN, enUS }
