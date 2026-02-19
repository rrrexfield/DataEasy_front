import { ApiService } from '../api'
import type {
  UploadDataParams,
  QueryDataParams,
  PaginationResult,
  ApiResponse,
} from '@/types/api'

// 数据上传
export function uploadData(params: UploadDataParams): Promise<ApiResponse> {
  const formData = new FormData()
  formData.append('file', params.file)
  formData.append('studyAreaId', params.studyAreaId)
  formData.append('date', params.date)

  return ApiService.post('/data/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 查询数据列表
export function queryDataList(
  params: QueryDataParams
): Promise<ApiResponse<PaginationResult<any>>> {
  return ApiService.get('/data/list', { params })
}

// 删除数据
export function deleteData(id: string): Promise<ApiResponse> {
  return ApiService.delete(`/data/${id}`)
}

// 获取研究区列表
export function getStudyAreas(): Promise<ApiResponse> {
  return ApiService.get('/data/study-areas')
}
