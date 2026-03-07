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

// 初始化数据库
import db from './db/database'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(pinia)
app.use(router)

// 初始化数据库后挂载应用
db.initialize().then(() => {
  console.log('✅ 数据库初始化完成')
  app.mount('#app')
}).catch(err => {
  console.error('❌ 数据库初始化失败，应用将以降级模式运行:', err)
  // 即使数据库初始化失败也挂载应用（降级模式）
  app.mount('#app')
})
