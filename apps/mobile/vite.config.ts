import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import postcssPxToViewport from 'postcss-px-to-viewport'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [VantResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [VantResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@common': resolve(__dirname, '../../packages/common/src'),
    },
  },
  css: {
    postcss: {
      plugins: [
        postcssPxToViewport({
          viewportWidth: 375, // 设计稿宽度
          unitPrecision: 5, // 转换后的精度
          viewportUnit: 'vw', // 指定需要转换成的视窗单位
          selectorBlackList: ['.ignore', '.hairlines'], // 不转换的类名
          minPixelValue: 1, // 小于或等于1px不转换
          mediaQuery: false, // 允许在媒体查询中转换px
          exclude: [/node_modules/], // 排除 node_modules
        }),
      ],
    },
    preprocessorOptions: {
      scss: {
        // 静默 Sass @import 弃用警告
        silenceDeprecations: ['import'],
        additionalData: (content: string, filePath: string) => {
          if (filePath.includes('variables.scss') || filePath.includes('mixins.scss')) {
            return content
          }
          return `@import "@/styles/variables.scss"; @import "@/styles/mixins.scss";\n${content}`
        },
      },
    },
  },
  server: {
    port: 5174,
    host: '0.0.0.0', // 允许局域网访问
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vant': ['vant'],
          'openlayers': ['ol'],
          'echarts': ['echarts'],
        },
      },
    },
  },
})
