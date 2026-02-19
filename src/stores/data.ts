import { defineStore } from 'pinia'
import type { SoilIndicator, SoilQualityIndex, TimeSeriesData } from '@/types'

interface DataState {
  currentStudyArea: string | null
  qualityIndex: SoilQualityIndex | null
  indicators: SoilIndicator[]
  timeSeriesData: TimeSeriesData[]
  selectedIndicator: string | null
  isLoading: boolean
}

export const useDataStore = defineStore('data', {
  state: (): DataState => ({
    currentStudyArea: null,
    qualityIndex: null,
    indicators: [],
    timeSeriesData: [],
    selectedIndicator: null,
    isLoading: false,
  }),

  getters: {
    hasData: state => state.indicators.length > 0,
    currentIndicator: state =>
      state.indicators.find(ind => ind.id === state.selectedIndicator),
    indicatorTimeSeries: state => {
      if (!state.selectedIndicator) return []
      return state.timeSeriesData.filter(data => data.indicator === state.selectedIndicator)
    },
  },

  actions: {
    setStudyArea(areaId: string) {
      this.currentStudyArea = areaId
    },

    setQualityIndex(index: SoilQualityIndex) {
      this.qualityIndex = index
    },

    setIndicators(indicators: SoilIndicator[]) {
      this.indicators = indicators
    },

    addIndicator(indicator: SoilIndicator) {
      this.indicators.push(indicator)
    },

    setTimeSeriesData(data: TimeSeriesData[]) {
      this.timeSeriesData = data
    },

    selectIndicator(indicatorId: string | null) {
      this.selectedIndicator = indicatorId
    },

    setLoading(isLoading: boolean) {
      this.isLoading = isLoading
    },

    clearData() {
      this.qualityIndex = null
      this.indicators = []
      this.timeSeriesData = []
      this.selectedIndicator = null
    },
  },
})
