import { defineStore } from 'pinia'
import type { AIAnalysisResult } from '@/types'

interface AIState {
  currentAnalysis: AIAnalysisResult | null
  analysisHistory: AIAnalysisResult[]
  isAnalyzing: boolean
  progress: number
  multiModalInputs: {
    hyperspectral: boolean
    terrain: boolean
    climate: boolean
  }
}

export const useAIStore = defineStore('ai', {
  state: (): AIState => ({
    currentAnalysis: null,
    analysisHistory: [],
    isAnalyzing: false,
    progress: 0,
    multiModalInputs: {
      hyperspectral: true,
      terrain: false,
      climate: false,
    },
  }),

  getters: {
    hasAnalysis: state => state.currentAnalysis !== null,
    latestAnalysis: state => state.analysisHistory[0] || null,
    enabledInputs: state => {
      return Object.entries(state.multiModalInputs)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key)
    },
  },

  actions: {
    setCurrentAnalysis(analysis: AIAnalysisResult) {
      this.currentAnalysis = analysis
      this.analysisHistory.unshift(analysis)
      // 只保留最近 10 条历史
      if (this.analysisHistory.length > 10) {
        this.analysisHistory = this.analysisHistory.slice(0, 10)
      }
    },

    startAnalysis() {
      this.isAnalyzing = true
      this.progress = 0
    },

    updateProgress(progress: number) {
      this.progress = progress
    },

    finishAnalysis() {
      this.isAnalyzing = false
      this.progress = 100
    },

    setMultiModalInput(input: keyof AIState['multiModalInputs'], enabled: boolean) {
      this.multiModalInputs[input] = enabled
    },

    clearCurrentAnalysis() {
      this.currentAnalysis = null
    },
  },
})
