// 全局 Toast 消息反馈系统
// 基于 Naive UI createDiscreteApi，无需依赖组件上下文
import { createDiscreteApi } from 'naive-ui'

const { message } = createDiscreteApi(['message'])

export function useToast() {
  return {
    success: (text: string) => message.success(text),
    error: (text: string) => message.error(text),
    warning: (text: string) => message.warning(text),
    info: (text: string) => message.info(text),
  }
}
