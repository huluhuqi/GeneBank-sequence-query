// 动画规范：统一管理过渡时长和缓动函数
export const animations = {
  fast: '0.15s ease',
  normal: '0.3s ease',
  slow: '0.5s ease',

  fade: {
    enter: 'opacity .3s ease',
    leave: 'opacity .3s ease',
  },

  slide: {
    enter: 'transform .3s ease, opacity .3s ease',
    leave: 'transform .3s ease, opacity .3s ease',
  },
} as const

// 保留旧导出兼容
export const animation = {
  duration: {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s',
  },
  easing: {
    ease: 'ease',
    easeInOut: 'ease-in-out',
    cubicBezier: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  transitions: {
    all: 'all 0.3s ease',
    background: 'background 0.35s ease',
    color: 'color 0.35s ease',
    transform: 'transform 0.3s ease',
    boxShadow: 'box-shadow 0.25s ease',
  },
} as const
