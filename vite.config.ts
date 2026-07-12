import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Inspector from 'unplugin-vue-dev-locator/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 部署路径，必须与仓库名完全一致（区分大小写）
  base: '/GeneBank-sequence-query/',
  build: {
    sourcemap: 'hidden',
    // 生产构建分块优化，避免单一 chunk 过大
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'pinia', 'naive-ui'],
          xlsx: ['xlsx'],
        },
      },
    },
  },
  plugins: [
    vue(),
    Inspector(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
