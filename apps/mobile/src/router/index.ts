import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录', requiresAuth: false },
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: { title: '首页', requiresAuth: true },
    },
    {
      path: '/data',
      name: 'DataManagement',
      component: () => import('@/views/Data.vue'),
      meta: { title: '数据管理', requiresAuth: true },
    },
    {
      path: '/inversion',
      name: 'Inversion',
      component: () => import('@/views/Inversion.vue'),
      meta: { title: '指标反演', requiresAuth: true },
    },
    {
      path: '/time-series',
      redirect: '/inversion?mode=timeseries',
    },
    {
      path: '/timeseries',
      redirect: '/inversion?mode=timeseries',
    },
    {
      path: '/report',
      name: 'Report',
      component: () => import('@/views/Report.vue'),
      meta: { title: '成果报告', requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/Profile.vue'),
      meta: { title: '我的', requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'DataEasy Mobile'  
  const authStore = useAuthStore()
  const isAuthed = authStore.checkAuth()
  const redirectPath = typeof to.query.redirect === 'string' ? to.query.redirect : '/home'
  
  if (to.meta.requiresAuth && !isAuthed) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && isAuthed) {
    next(redirectPath)
  } else {
    next()
  }
})

export default router
