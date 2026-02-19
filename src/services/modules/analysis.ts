import { ApiService } from '../api'
import type {
  InversionParams,
  InversionResult,
  AIAnalysisParams,
  ApiResponse,
} from '@/types/api'

// 开始指标反演
export function startInversion(params: InversionParams): Promise<ApiResponse<InversionResult>> {
  return ApiService.post('/analysis/inversion', params)
}

// 查询反演任务状态
export function getInversionStatus(taskId: string): Promise<ApiResponse<InversionResult>> {
  return ApiService.get(`/analysis/inversion/${taskId}`)
}

// AI 多模态分析
export function performAIAnalysis(params: AIAnalysisParams): Promise<ApiResponse> {
  return ApiService.post('/analysis/ai', params)
}

// 获取时序分析数据
export function getTimeSeriesAnalysis(params: {
  studyAreaId: string
  indicator: string
  startDate: string
  endDate: string
}): Promise<ApiResponse> {
  return ApiService.get('/analysis/time-series', { params })
}
