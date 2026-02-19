// API 接口类型定义
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 数据管理 API
export interface UploadDataParams {
  file: File
  studyAreaId: string
  date: string
}

export interface QueryDataParams extends PaginationParams {
  studyAreaId?: string
  startDate?: string
  endDate?: string
}

// 指标反演 API
export interface InversionParams {
  studyAreaId: string
  indicator: 'organicMatter' | 'waterContent' | 'salinization'
  date: string
  params?: Record<string, any>
}

export interface InversionResult {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  result?: {
    imageUrl: string
    statistics: {
      mean: number
      max: number
      min: number
      distribution: Array<{ level: string; percentage: number }>
    }
  }
}

// AI 分析 API
export interface AIAnalysisParams {
  studyAreaId: string
  date: string
  multiModalInputs: {
    hyperspectral: boolean
    terrain: boolean
    climate: boolean
  }
}

// 报告生成 API
export interface ReportParams {
  studyAreaId: string
  startDate: string
  endDate: string
  includeCharts: boolean
}
