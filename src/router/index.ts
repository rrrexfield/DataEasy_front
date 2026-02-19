import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/home',
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
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE}`
  }
  next()
})

export default router
