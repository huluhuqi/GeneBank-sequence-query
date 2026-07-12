// 响应式断点规范
export const breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  large: 1440,
} as const

export type BreakpointKey = keyof typeof breakpoints

// 工具函数：判断当前视口是否小于指定断点
export function isBelow(breakpoint: BreakpointKey): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < breakpoints[breakpoint]
}

// 工具函数：判断当前视口是否大于指定断点
export function isAbove(breakpoint: BreakpointKey): boolean {
  if (typeof window === 'undefined') return true
  return window.innerWidth >= breakpoints[breakpoint]
}
