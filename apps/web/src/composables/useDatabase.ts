/**
 * 数据库 Composable
 * 提供 Vue 组件中使用的数据库钩子
 */

import { ref } from 'vue'
import db from '@/db/database'
import * as api from '@/db/api'

/**
 * 初始化数据库
 */
export function useDatabase() {
  const isInitialized = ref(false)
  const error = ref<string | null>(null)

  const initialize = async () => {
    try {
      await db.initialize()
      isInitialized.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '数据库初始化失败'
      console.error('数据库初始化失败:', err)
    }
  }

  return {
    isInitialized,
    error,
    initialize
  }
}

/**
 * 反演数据 Composable
 */
export function useInversionData() {
  const dataList = ref<api.InversionData[]>([])
  
  // 初始化时尝试加载数据，如果失败则使用空数组
  try {
    dataList.value = api.inversionDataAPI.getAll()
  } catch (err) {
    console.warn('加载反演数据失败，使用空数据:', err)
    dataList.value = []
  }

  const refresh = () => {
    try {
      dataList.value = api.inversionDataAPI.getAll()
    } catch (err) {
      console.warn('刷新反演数据失败:', err)
    }
  }

  const deleteData = (id: string) => {
    try {
      api.inversionDataAPI.delete(id)
      refresh()
    } catch (err) {
      console.error('删除数据失败:', err)
    }
  }

  return {
    dataList,
    refresh,
    deleteData
  }
}

/**
 * 图层配置 Composable
 */
export function useImageLayers() {
  const layers = ref<api.ImageLayer[]>([])
  
  try {
    layers.value = api.imageLayerAPI.getAll()
  } catch (err) {
    console.warn('加载图层配置失败，使用空数据:', err)
    layers.value = []
  }

  const refresh = () => {
    try {
      layers.value = api.imageLayerAPI.getAll()
    } catch (err) {
      console.warn('刷新图层配置失败:', err)
    }
  }

  const updateVisibility = (id: string, visible: boolean) => {
    try {
      api.imageLayerAPI.updateVisibility(id, visible)
      refresh()
    } catch (err) {
      console.error('更新图层可见性失败:', err)
    }
  }

  const updateOpacity = (id: string, opacity: number) => {
    try {
      api.imageLayerAPI.updateOpacity(id, opacity)
      refresh()
    } catch (err) {
      console.error('更新图层透明度失败:', err)
    }
  }

  return {
    layers,
    refresh,
    updateVisibility,
    updateOpacity
  }
}

/**
 * 风险区域 Composable
 */
export function useRiskZones() {
  const zones = ref<api.RiskZone[]>([])
  
  try {
    zones.value = api.riskZoneAPI.getAll()
  } catch (err) {
    console.warn('加载风险区域失败，使用空数据:', err)
    zones.value = []
  }

  return {
    zones
  }
}

/**
 * 归因因子 Composable
 */
export function useAttributionFactors() {
  const factors = ref<api.AttributionFactor[]>([])
  
  try {
    factors.value = api.attributionFactorAPI.getAll()
  } catch (err) {
    console.warn('加载归因因子失败，使用空数据:', err)
    factors.value = []
  }

  const refresh = () => {
    try {
      factors.value = api.attributionFactorAPI.getAll()
    } catch (err) {
      console.warn('刷新归因因子失败:', err)
    }
  }

  const reset = (newFactors: api.AttributionFactor[]) => {
    try {
      api.attributionFactorAPI.reset(newFactors)
      refresh()
    } catch (err) {
      console.error('重置归因因子失败:', err)
    }
  }

  return {
    factors,
    refresh,
    reset
  }
}

/**
 * 土壤指标 Composable
 */
export function useSoilIndicators() {
  const indicators = ref<api.SoilIndicator[]>([])
  
  try {
    indicators.value = api.soilIndicatorAPI.getAll()
  } catch (err) {
    console.warn('加载土壤指标失败，使用空数据:', err)
    indicators.value = []
  }

  return {
    indicators
  }
}

/**
 * 时序数据 Composable
 */
export function useTimelineData() {
  const timeline = ref<api.TimelineData[]>([])
  
  try {
    timeline.value = api.timelineDataAPI.getAll()
  } catch (err) {
    console.warn('加载时序数据失败，使用空数据:', err)
    timeline.value = []
  }

  return {
    timeline
  }
}

/**
 * 报告 Composable
 */
export function useReports() {
  const reports = ref<api.Report[]>([])
  
  try {
    reports.value = api.reportAPI.getAll()
  } catch (err) {
    console.warn('加载报告列表失败，使用空数据:', err)
    reports.value = []
  }

  const refresh = () => {
    try {
      reports.value = api.reportAPI.getAll()
    } catch (err) {
      console.warn('刷新报告列表失败:', err)
    }
  }

  const getById = (id: string) => {
    try {
      const report = api.reportAPI.getById(id)
      if (!report) {
        console.warn(`报告 ${id} 未找到`)
      }
      return report
    } catch (err) {
      console.error(`获取报告详情失败 (id: ${id}):`, err)
      // 打印完整错误栈
      if (err instanceof Error) {
        console.error('错误详情:', err.message, err.stack)
      }
      return null
    }
  }

  const create = (report: api.Report) => {
    try {
      api.reportAPI.create(report)
      refresh()
    } catch (err) {
      console.error('创建报告失败:', err)
    }
  }

  const deleteReport = (id: string) => {
    try {
      api.reportAPI.delete(id)
      refresh()
    } catch (err) {
      console.error('删除报告失败:', err)
    }
  }

  return {
    reports,
    refresh,
    getById,
    create,
    deleteReport
  }
}

/**
 * 土壤综合指数 Composable
 */
export function useSoilIndex() {
  const soilIndexData = ref<api.SoilIndex | null>(null)
  
  try {
    soilIndexData.value = api.soilIndexAPI.get()
  } catch (err) {
    console.warn('加载土壤综合指数失败，使用空数据:', err)
    soilIndexData.value = null
  }

  const refresh = () => {
    try {
      soilIndexData.value = api.soilIndexAPI.get()
    } catch (err) {
      console.warn('刷新土壤综合指数失败:', err)
    }
  }

  const update = (data: api.SoilIndex) => {
    try {
      api.soilIndexAPI.update(data)
      refresh()
    } catch (err) {
      console.error('更新土壤综合指数失败:', err)
    }
  }

  return {
    soilIndex: soilIndexData,
    refresh,
    update
  }
}
