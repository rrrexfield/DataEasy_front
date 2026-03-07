import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface RiskZone {
  id: string
  label: string
  lon: number
  lat: number
  riskLevel: 'high' | 'medium' | 'low'
  riskText: string
  confidence: string
  hint: string
}

export const useAIStore = defineStore('ai', () => {
  const qualityScore = ref(72)
  const aiAnalysisText = ref('该区域整体土壤质量处于中等偏好水平')
  const showWarningOverlay = ref(false)
  
  const riskZones = ref<RiskZone[]>([
    {
      id: 'risk-1',
      label: '西北部区域',
      lon: 110.25,
      lat: 29.35,
      riskLevel: 'high',
      riskText: '高风险',
      confidence: '92%',
      hint: '建议优先改良',
    },
  ])
  
  return {
    qualityScore,
    aiAnalysisText,
    showWarningOverlay,
    riskZones,
  }
})
