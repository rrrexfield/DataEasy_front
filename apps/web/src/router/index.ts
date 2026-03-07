import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/home',
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: {
          title: '首页总览',
          icon: 'Odometer',
        },
      },
      {
        path: 'data',
        name: 'DataManagement',
        component: () => import('@/views/DataManagement.vue'),
        meta: {
          title: '数据管理',
          icon: 'Document',
        },
      },
      {
        path: 'inversion',
        name: 'Inversion',
        component: () => import('@/views/Inversion.vue'),
        meta: {
          title: '指标反演',
          icon: 'DataAnalysis',
        },
      },
      {
        path: 'time-series',
        name: 'TimeSeries',
        component: () => import('@/views/TimeSeries.vue'),
        meta: {
          title: '时序分析',
          icon: 'TrendCharts',
        },
      },
      {
        path: 'report',
        name: 'Report',
        component: () => import('@/views/Report.vue'),
        meta: {
          title: '成果报告',
          icon: 'Document',
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE}`
  }

  const authStore = useAuthStore()
  
  // 检查路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (requiresAuth) {
    // 需要认证的路由
    if (!authStore.checkAuth()) {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }, // 保存原本要访问的路径
      })
    } else {
      next()
    }
  } else {
    // 不需要认证的路由
    if (to.path === '/login' && authStore.isAuthenticated) {
      // 已登录用户访问登录页，重定向到首页
      next('/home')
    } else {
      next()
    }
  }
})

export default router
