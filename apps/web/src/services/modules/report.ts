import { ApiService } from '../api'
import type { ReportParams, ApiResponse } from '@/types/api'

// 生成报告
export function generateReport(params: ReportParams): Promise<ApiResponse> {
  return ApiService.post('/report/generate', params)
}

// 获取报告列表
export function getReportList(): Promise<ApiResponse> {
  return ApiService.get('/report/list')
}

// 下载报告
export function downloadReport(reportId: string): Promise<ApiResponse> {
  return ApiService.get(`/report/download/${reportId}`, {
    responseType: 'blob',
  })
}

// 预览报告
export function previewReport(reportId: string): Promise<ApiResponse> {
  return ApiService.get(`/report/preview/${reportId}`)
}
