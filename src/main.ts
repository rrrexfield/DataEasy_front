import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'

// Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 样式导入
// 注意：variables.scss 和 mixins.scss 已通过 Vite 全局注入，无需手动导入
import 'element-plus/dist/index.css'
import './styles/global.scss'
import './styles/theme.scss'

// OpenLayers 样式
import 'ol/ol.css'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')
