import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface InversionData {
  id: string
  name: string
  studyArea: string
  date: string
  type: string
  size: string
}

export const useDataStore = defineStore('data', () => {
  const inversionDataList = ref<InversionData[]>([
    {
      id: 'e4a7b9c2f6d1',
      name: 'DZ01V_L2_E110.3_N29.2_20251225031144_01_T1_MTL',
      studyArea: '湖南省张家界市',
      date: '2025-12-25',
      type: '高光谱',
      size: '34MB',
    },
  ])
  
  const selectedIndicator = ref('OC')
  
  const setIndicator = (indicator: string) => {
    selectedIndicator.value = indicator
  }
  
  return {
    inversionDataList,
    selectedIndicator,
    setIndicator,
  }
})
