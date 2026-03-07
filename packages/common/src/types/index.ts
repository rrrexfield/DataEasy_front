/**
 * 土壤指标接口
 */
export interface SoilIndicator {
  id: string
  name: string
  value: number
  unit: string
  confidence: number
}

/**
 * 反演数据接口
 */
export interface InversionData {
  id: string
  name: string
  studyArea: string
  date: string
  type: string
  size: string
}

/**
 * 反演参数接口
 */
export interface InversionParams {
  indicator: 'OC' | 'TN' | 'TP' | 'waterContent' | 'NDVI'
  region: string[]
  dataSource: string
  model: 'rf' | 'svm' | 'dl'
}

/**
 * 反演结果接口
 */
export interface InversionResult {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  result?: {
    mean: number
    max: number
    min: number
    std: number
    median: number
    cv: number
  }
}

/**
 * 风险等级
 */
export type RiskLevel = 'high' | 'medium' | 'low'

/**
 * 风险区域接口
 */
export interface RiskZone {
  id: string
  label: string
  lon: number
  lat: number
  riskLevel: RiskLevel
  riskText: string
  confidence: string
  hint: string
  pixelPosition?: [number, number]
}

/**
 * 报告数据接口
 */
export interface ReportData {
  id: string
  name: string
  createTime: string
  startDate: string
  endDate: string
  studyArea: string
  analysisType: 'single' | 'timeseries'
  qualityScore: number
  qualityLevel: string
  summary: string
  recommendations: string[]
  dataSource?: {
    id: string
    name: string
    date: string
    productId: string
    spacecraft: string
    sensor: string
    bounds: {
      north: number
      south: number
      east: number
      west: number
    }
  }
  indicators: {
    organicMatter: IndicatorDetail
    moisture: IndicatorDetail
    salinity: SalinityDetail
  }
}

/**
 * 指标详情接口
 */
export interface IndicatorDetail {
  avg: number
  min?: number
  max?: number
  std?: number
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'normal' | 'warning'
  description?: string
}

/**
 * 盐渍化详情接口
 */
export interface SalinityDetail {
  level: 'none' | 'light' | 'moderate' | 'severe'
  area: string
  coverage?: string
  status: 'good' | 'warning' | 'danger'
  description?: string
}

/**
 * 影像元数据接口
 */
export interface ImageMetadata {
  productId: string
  spacecraft: string
  sensor: string
  date: string
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  resolution?: number
  cloudCover?: number
}
