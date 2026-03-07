// 全局类型定义
export interface SoilIndicator {
  id: string
  name: string
  value: number
  unit: string
  level: string
  color: string
}

export interface MapLayer {
  id: string
  name: string
  visible: boolean
  opacity: number
  type: 'hyperspectral' | 'heatmap' | 'base'
}

export interface TimeSeriesData {
  date: string
  value: number
  indicator: string
}

export interface AIAnalysisResult {
  timestamp: string
  conclusion: string
  riskAreas: Array<{
    location: [number, number]
    level: string
    description: string
  }>
  confidence: number
}

export interface StudyArea {
  id: string
  name: string
  center: [number, number]
  bounds: [[number, number], [number, number]]
}

export interface SoilQualityIndex {
  overall: number
  organicMatter: number
  waterContent: number
  salinization: number
}
