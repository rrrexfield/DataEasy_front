import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

/**
 * 创建 Axios 实例
 */
export const createApiClient = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      return response.data
    },
    (error) => {
      if (error.response?.status === 401) {
        // 未授权，清除 token 并跳转到登录页
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

/**
 * 数据管理 API
 */
export const dataApi = (client: AxiosInstance) => ({
  // 获取数据列表
  getDataList: (params?: any) => client.get('/data/list', { params }),
  
  // 上传数据
  uploadData: (formData: FormData) => client.post('/data/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // 删除数据
  deleteData: (id: string) => client.delete(`/data/${id}`),
  
  // 下载数据
  downloadData: (id: string) => client.get(`/data/download/${id}`, {
    responseType: 'blob'
  }),
})

/**
 * 反演分析 API
 */
export const analysisApi = (client: AxiosInstance) => ({
  // 开始反演
  startInversion: (params: any) => client.post('/analysis/inversion', params),
  
  // 获取反演结果
  getInversionResult: (id: string) => client.get(`/analysis/result/${id}`),
  
  // 获取反演进度
  getInversionProgress: (id: string) => client.get(`/analysis/progress/${id}`),
})

/**
 * 报告生成 API
 */
export const reportApi = (client: AxiosInstance) => ({
  // 生成报告
  generateReport: (params: any) => client.post('/report/generate', params),
  
  // 获取报告列表
  getReportList: () => client.get('/report/list'),
  
  // 获取报告详情
  getReportDetail: (id: string) => client.get(`/report/${id}`),
  
  // 导出报告
  exportReport: (id: string, format: 'pdf' | 'word' | 'image') => 
    client.get(`/report/export/${id}`, {
      params: { format },
      responseType: 'blob'
    }),
})

export { type AxiosInstance }
