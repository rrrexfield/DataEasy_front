import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 使用函数形式避免在 variables.scss 和 mixins.scss 自身中循环导入
        additionalData: (content: string, filePath: string) => {
          // 不在 variables.scss 和 mixins.scss 文件本身中注入导入
          if (filePath.includes('variables.scss') || filePath.includes('mixins.scss')) {
            return content
          }
          return `@import "@/styles/variables.scss"; @import "@/styles/mixins.scss";\n${content}`
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
