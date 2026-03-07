import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import db from './db/database'
import '@vant/touch-emulator' // 桌面端模拟触摸事件
import './styles/global.scss'

// Use Vant native dark mode as the baseline theme.
document.documentElement.classList.add('van-theme-dark')
document.body.classList.add('van-theme-dark')

const app = createApp(App)

app.use(createPinia())
app.use(router)

db.initialize().then(() => {
	app.mount('#app')
}).catch((error) => {
	console.error('Database initialization failed, app will continue in degraded mode:', error)
	app.mount('#app')
})
