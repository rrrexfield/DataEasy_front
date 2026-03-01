<template>
  <div class="home-page">
    <el-row :gutter="16" style="height: 100%">
      <!-- 中央地图区域 -->
      <el-col :span="16">
        <el-card class="map-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>研究区地图</span>
              <div class="header-actions">
                <!-- 选择已反演数据 -->
                <el-select
                  v-model="selectedDataId"
                  placeholder="选择已反演数据"
                  size="small"
                  clearable
                  filterable
                  class="data-select"
                  popper-class="data-select-popper"
                  @change="handleDataSelect"
                  @clear="handleDataClear"
                >
                  <el-option
                    v-for="item in inversionDataList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                    <div class="data-option">
                      <div class="data-name">{{ item.name }}</div>
                      <div class="data-id">ID: {{ item.id }}</div>
                    </div>
                  </el-option>
                </el-select>
                <!-- 行政区快速定位 -->
                <el-cascader
                  v-model="selectedRegion"
                  placeholder="选择行政区定位"
                  size="small"
                  clearable
                  filterable
                  :options="CHINA_REGIONS as any"
                  :props="{ checkStrictly: true, expandTrigger: 'hover', value: 'value', label: 'label' }"
                  class="region-select"
                  @change="handleRegionChange"
                />
                <!-- 图层图例 -->
                <div class="legend-bar">
                  <span class="legend-item">
                    <span class="legend-dot legend-dot--low"></span>低不确定性
                  </span>
                  <span class="legend-item">
                    <span class="legend-dot legend-dot--high"></span>高不确定性
                  </span>
                </div>
                <!-- 图层控制面板 -->
                <el-popover placement="bottom" :width="320" trigger="hover">
                  <template #reference>
                    <el-button size="small" :icon="FolderOpened">
                      图层管理
                    </el-button>
                  </template>
                  <div class="layer-control-panel">
                    <div class="layer-control-header">
                      <span>遥感图层管理</span>
                      <el-button 
                        size="small" 
                        text
                        @click="toggleAllLayers"
                      >
                        {{ allLayersEnabled ? '全部关闭' : '全部开启' }}
                      </el-button>
                    </div>
                    <div class="layer-list">
                      <div 
                        v-for="layer in imageLayers" 
                        :key="layer.id"
                        class="layer-item"
                      >
                        <div class="layer-header">
                          <el-switch
                            v-model="layer.visible"
                            size="small"
                            @change="toggleLayer(layer)"
                          />
                          <span 
                            class="layer-name"
                            :title="layer.description"
                          >
                            {{ layer.name }}
                          </span>
                        </div>
                        <div v-if="layer.visible" class="layer-opacity">
                          <span class="opacity-label">透明度</span>
                          <el-slider
                            v-model="layer.opacity"
                            :min="0"
                            :max="100"
                            :show-tooltip="false"
                            size="small"
                            @input="updateLayerOpacity(layer)"
                          />
                          <span class="opacity-value">{{ layer.opacity }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-popover>
                <!-- 警告覆盖层开关 -->
                <el-switch
                  v-model="showWarningOverlay"
                  active-text="告警点"
                  size="small"
                />
                <el-button-group>
                  <el-button size="small" :icon="ZoomIn" @click="handleZoomIn" />
                  <el-button size="small" :icon="ZoomOut" @click="handleZoomOut" />
                  <el-button size="small" :icon="RefreshRight" @click="handleRefresh" />
                </el-button-group>
              </div>
            </div>
          </template>

          <!-- 地图容器 + 警告覆盖层 -->
          <div class="map-wrapper">
            <div ref="mapContainer" class="map-container"></div>

            <!-- 高风险区域标注覆盖层 -->
            <div v-if="showWarningOverlay && hasSelectedData" class="map-overlay">
              <div
                v-for="zone in riskZones"
                :key="zone.id"
                class="risk-zone-marker"
                :class="`risk-zone-marker--${zone.riskLevel}`"
                :style="zone.pixelPosition ? { left: zone.pixelPosition[0] + 'px', top: zone.pixelPosition[1] + 'px' } : {}"
                @mouseenter="activeZone = zone"
                @mouseleave="activeZone = null"
              >
                <span class="risk-zone-dot"></span>
                <div v-if="activeZone?.id === zone.id" class="risk-zone-tooltip">
                  <div class="tooltip-title">{{ zone.label }}</div>
                  <div class="tooltip-row">风险等级：<span :class="`risk-text--${zone.riskLevel}`">{{ zone.riskText }}</span></div>
                  <div class="tooltip-row">可信度：{{ zone.confidence }}</div>
                  <div class="tooltip-row tooltip-hint">{{ zone.hint }}</div>
                </div>
              </div>
            </div>

            <!-- 顶部警告横幅 -->
            <div v-if="hasSelectedData" class="map-alert-banner">
              <el-icon class="alert-icon"><Warning /></el-icon>
              <span>发现 <strong>{{ reviewZoneCount }} 处</strong>高风险区域 → 建议优先关注</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧结果栏 -->
      <el-col :span="8">
        <div class="right-panel">

          <!-- 暂无数据提示 -->
          <div v-if="!hasSelectedData" class="no-data-placeholder">
            <el-empty description="暂无研究结果">
              <template #image>
                <el-icon :size="80" color="#606266">
                  <FolderOpened />
                </el-icon>
              </template>
              <template #description>
                <p class="empty-title">暂无研究结果</p>
                <p class="empty-hint">请从地图顶栏选择已反演数据以查看分析结果</p>
              </template>
            </el-empty>
          </div>

          <!-- 有数据时显示结果 -->
          <template v-else>

          <!-- ① 综合指数 + 不确定性可视化 -->
          <el-card class="index-card" shadow="never">
            <template #header>
              <span>土壤质量综合指数</span>
            </template>
            <div class="index-body">
              <!-- 指数数值 + 可信度 -->
              <div class="index-stats">
                <div class="index-sub-row">
                  <span class="sub-label">有机质含量</span>
                  <span class="sub-value">{{ soilIndex.organicMatter }}%</span>
                </div>
                <div class="index-sub-row">
                  <span class="sub-label">土壤含水量</span>
                  <span class="sub-value success">{{ soilIndex.waterContent }}%</span>
                </div>
                <div class="index-sub-row">
                  <span class="sub-label">地形起伏</span>
                  <span class="sub-value">{{ soilIndex.terrainUndulation }}%</span>
                </div>
                <div class="index-sub-row">
                  <span class="sub-label">盐分特征</span>
                  <span class="sub-value warning">{{ soilIndex.salinityFeature }}%</span>
                </div>
                <div class="index-sub-row">
                  <span class="sub-label">酸碱度</span>
                  <span class="sub-value success">{{ soilIndex.phLevel }}</span>
                </div>
                <!-- 可信度条 -->
                <div class="confidence-bar-wrap">
                  <span class="confidence-label">
                    可信度：<strong :class="`confidence-text--${soilIndex.confidenceLevel}`">{{ soilIndex.confidenceText }}</strong>
                  </span>
                  <el-progress
                    :percentage="soilIndex.confidencePct"
                    :color="confidenceBarColor"
                    :stroke-width="6"
                    :show-text="false"
                    class="confidence-progress"
                  />
                </div>
              </div>
              <!-- 仪表盘 -->
              <div ref="gaugeContainer" class="chart-container"></div>
            </div>
          </el-card>

          <!-- ② 主动复核提醒（第一层：风险×可信度）-->
          <el-card class="review-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span><el-icon class="warn-icon"><Warning /></el-icon> 复核建议</span>
              </div>
            </template>
            <div class="review-list">
              <div
                v-for="zone in riskZones"
                :key="zone.id"
                class="review-item"
                :class="`review-item--${zone.riskLevel}`"
                @click="focusZone(zone)"
              >
                <span class="review-dot" :class="`review-dot--${zone.riskLevel}`"></span>
                <div class="review-info">
                  <span class="review-name">{{ zone.label }}</span>
                  <span class="review-desc">{{ zone.riskText }} 风险 · 可信度 {{ zone.confidence }}</span>
                </div>
                <el-tag size="small" :type="zone.tagType">{{ zone.action }}</el-tag>
              </div>
              <div class="review-summary">
                <el-icon><InfoFilled /></el-icon>
                建议优先人工复核区域（{{ reviewZoneCount }} 处）
              </div>
            </div>
          </el-card>

          <!-- ③ AI 自动解读 + 自然语言 + 归因面板 -->
          <el-card class="ai-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>AI 自动解读</span>
                <div class="ai-mode-switch">
                  <el-tag type="success" size="small">
                    <el-icon><CircleCheck /></el-icon>
                    AI 自动分析
                  </el-tag>
                </div>
              </div>
            </template>
            <div class="ai-content">

              <!-- 自然语言解读 -->
              <div class="ai-nl-block">
                <div class="ai-conclusion">{{ aiConclusion }}</div>
                <div class="ai-confidence-tip">
                  模型可信度：<strong class="confidence-text--medium">{{ aiConfidenceLabel }}</strong>，建议在本季度内进行重点监测。
                </div>
              </div>

              <!-- 归因折叠面板（第二层）-->
              <el-collapse v-model="activeCollapse" class="attribution-collapse">
                <el-collapse-item name="attribution">
                  <template #title>
                    <span class="collapse-title">
                      <el-icon><DataAnalysis /></el-icon>
                      结果归因分析
                    </span>
                  </template>
                  <div class="attribution-list">
                    <div
                      v-for="factor in attributionFactors"
                      :key="factor.name"
                      class="attribution-item"
                      :class="{ 'is-active': activeFactorName === factor.name }"
                      @click="toggleFactor(factor)"
                      @mouseenter="hoveredFactor = factor"
                      @mouseleave="hoveredFactor = null"
                    >
                      <div class="attr-left">
                        <el-icon class="attr-check"><Select /></el-icon>
                        <span class="attr-name">{{ factor.name }}</span>
                        <span v-if="hoveredFactor?.name === factor.name" class="attr-hint">{{ factor.hint }}</span>
                      </div>
                      <div class="attr-right">
                        <el-progress
                          :percentage="factor.pct"
                          :color="factor.color"
                          :stroke-width="5"
                          :show-text="false"
                          style="width: 80px"
                        />
                        <span class="attr-pct">{{ factor.pct }}%</span>
                      </div>
                    </div>
                    <div v-if="activeFactorName" class="attr-map-hint">
                      <el-icon><MapLocation /></el-icon>
                      地图已高亮「{{ activeFactorName }}」空间分布
                    </div>
                  </div>
                </el-collapse-item>

                <!-- 决策建议（第三层）-->
                <el-collapse-item name="decision">
                  <template #title>
                    <span class="collapse-title">
                      <el-icon><Promotion /></el-icon>
                      决策建议
                    </span>
                  </template>
                  <div class="decision-content">
                    <ul class="decision-list">
                      <li v-for="item in decisionItems" :key="item">{{ item }}</li>
                    </ul>
                    <div class="decision-actions">
                      <el-button size="small" type="primary" @click="handleSuggestMeasures">
                        <el-icon><Promotion /></el-icon>建议措施
                      </el-button>
                      <el-button size="small" @click="handleGenerateReport">
                        <el-icon><Document /></el-icon>生成监测建议单
                      </el-button>
                      <el-button size="small" type="warning" @click="handleMarkFocus">
                        <el-icon><StarFilled /></el-icon>标记重点区域
                      </el-button>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>

              <!-- AI + 专家协同入口 -->
              <div class="expert-mode-bar">
                <div class="expert-mode-label">
                  <el-icon><User /></el-icon>
                  当前模式：<strong>AI 自动分析</strong>
                </div>
                <el-tooltip content="AI + 专家复核模式规划中" placement="top">
                  <el-button size="small" disabled class="expert-btn">
                    AI + 专家复核
                    <el-tag size="small" class="coming-tag">规划中</el-tag>
                  </el-button>
                </el-tooltip>
              </div>
              <div class="expert-note">
                <el-icon><InfoFilled /></el-icon>
                本结论支持专家复核标注（开发中）
              </div>

            </div>
          </el-card>

          </template>

        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
  ZoomIn, ZoomOut, RefreshRight, CircleCheck,
  Warning, DataAnalysis, Select, MapLocation,
  Promotion, Document, StarFilled, User, InfoFilled, FolderOpened,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import {
  createBaseMap,
  flyToRegion,
  CHINA_REGIONS,
  type RegionItem,
  addRemoteSensingImage,
  lonLatToPixel,
  lonLatToMapCoord,
} from '@/utils/map-utils'
import { createGaugeConfig } from '@/utils/chart-config'
import { useMapStore } from '@/stores'
import { parseMTLFile, type ImageMetadata } from '@/utils/metadata-parser'

const route = useRoute()
const mapStore = useMapStore()

const mapContainer = ref<HTMLElement>()
const gaugeContainer = ref<HTMLElement>()
let map: any = null
let gaugeChart: echarts.ECharts | null = null

// ─── 数据选择 ───────────────────────────────────────────────
const selectedDataId = ref<string | null>(null)
const hasSelectedData = computed(() => !!selectedDataId.value)

// 可选的反演数据列表（从数据管理页面获取）
const inversionDataList = ref([
  {
    id: 'e4a7b9c2f6d1',
    name: 'DZ01V_L2_E110.3_N29.2_20251225031144_01_T1_MTL',
    studyArea: '湖南省张家界市',
    date: '2025-12-25',
    type: '高光谱',
    size: '34MB',
  },
  {
    id: '9f2d4e8a1c5b',
    name: '高光谱影像数据_2024Q1',
    studyArea: '研究区A',
    date: '2024-03-15',
    type: '高光谱',
    size: '125MB',
  },
  {
    id: '7c3a8d5e2f9b',
    name: '地形数据_DEM',
    studyArea: '研究区A',
    date: '2024-03-10',
    type: '地形',
    size: '45MB',
  },
])

const handleDataSelect = async (dataId: string | null | undefined) => {
  // 处理清除或未定义的情况
  if (!dataId) {
    clearDataAndLayers()
    return
  }
  
  // 选择了数据，加载遥感图像和分析结果
  await loadRemoteSensingData()
  // 等待 DOM 更新后初始化仪表盘
  await nextTick()
  initGaugeChart()
  ElMessage.success('研究结果加载成功')
}

const handleDataClear = async () => {
  // 明确清除选择
  selectedDataId.value = null
  // 等待 Vue 更新
  await nextTick()
  clearDataAndLayers()
}

const clearDataAndLayers = () => {
  // 清除所有图层
  clearAllLayers()
  // 清除仪表盘
  if (gaugeChart) {
    gaugeChart.dispose()
    gaugeChart = null
  }
  ElMessage.info('已清除研究结果')
}

const clearAllLayers = () => {
  // 清除所有图层
  imageLayers.value.forEach(layer => {
    if (layer.layer) {
      layer.layer.setVisible(false)
      layer.visible = false
    }
  })
}

// ─── 图层管理 ───────────────────────────────
interface ImageLayerConfig {
  id: string
  name: string
  description: string
  url: string
  visible: boolean
  opacity: number
  layer: any
  category: 'raw' | 'processed' | 'prediction' | 'uncertainty'
}

const imageLayers = ref<ImageLayerConfig[]>([
  {
    id: 'raw_rgb',
    name: '原始高光谱RGB',
    description: '原始高光谱场景RGB预览图，显示研究区域的真彩合成图像',
    url: '/demo_bundle/raw/raw_rgb_preview.png',
    visible: false,
    opacity: 80,
    layer: null,
    category: 'raw'
  },
  {
    id: 'ndvi',
    name: '植被指数NDVI',
    description: '归一化植被指数，反映植被生长状态和覆盖度',
    url: '/demo_bundle/processed/ndvi_preview.png',
    visible: false,
    opacity: 70,
    layer: null,
    category: 'processed'
  },
  {
    id: 'dem',
    name: '地形DEM',
    description: '数字高程模型，显示地表起伏和地形特征',
    url: '/demo_bundle/processed/dem_preview.png',
    visible: false,
    opacity: 60,
    layer: null,
    category: 'processed'
  },
  {
    id: 'pred_oc',
    name: '有机碳预测',
    description: '土壤有机碳含量预测图（0-5cm深度）',
    url: '/demo_bundle/results/pred_OC_0-5cm_1km_mean_preview.png',
    visible: false,
    opacity: 65,
    layer: null,
    category: 'prediction'
  },
  {
    id: 'pred_tn',
    name: '全氮预测',
    description: '土壤全氮含量预测图（0-5cm深度）',
    url: '/demo_bundle/results/pred_TN_0-5cm_1km_mean_preview.png',
    visible: false,
    opacity: 65,
    layer: null,
    category: 'prediction'
  },
  {
    id: 'pred_tp',
    name: '全磷预测',
    description: '土壤全磷含量预测图（0-5cm深度）',
    url: '/demo_bundle/results/pred_TP_0-5cm_1km_mean_preview.png',
    visible: false,
    opacity: 65,
    layer: null,
    category: 'prediction'
  },
  {
    id: 'unc_oc',
    name: '有机碳不确定性',
    description: '有机碳预测的不确定性评估，反映预测的可靠度',
    url: '/demo_bundle/results/unc_OC_0-5cm_1km_mean_preview.png',
    visible: true,
    opacity: 60,
    layer: null,
    category: 'uncertainty'
  },
  {
    id: 'unc_tn',
    name: '全氮不确定性',
    description: '全氮预测的不确定性评估，反映预测的可靠度',
    url: '/demo_bundle/results/unc_TN_0-5cm_1km_mean_preview.png',
    visible: false,
    opacity: 60,
    layer: null,
    category: 'uncertainty'
  },
  {
    id: 'unc_tp',
    name: '全磷不确定性',
    description: '全磷预测的不确定性评估，反映预测的可靠度',
    url: '/demo_bundle/results/unc_TP_0-5cm_1km_mean_preview.png',
    visible: false,
    opacity: 60,
    layer: null,
    category: 'uncertainty'
  },
])

const allLayersEnabled = computed(() => 
  imageLayers.value.every(layer => layer.visible)
)

const toggleAllLayers = () => {
  const newState = !allLayersEnabled.value
  imageLayers.value.forEach(layer => {
    layer.visible = newState
    toggleLayer(layer)
  })
}

const toggleLayer = (layerConfig: ImageLayerConfig) => {
  if (!map || !imageMetadata.value) return
  
  if (layerConfig.visible) {
    // 显示图层
    if (!layerConfig.layer) {
      layerConfig.layer = addRemoteSensingImage(
        map,
        layerConfig.url,
        imageMetadata.value.extent,
        layerConfig.opacity / 100
      )
    } else {
      layerConfig.layer.setVisible(true)
    }
  } else {
    // 隐藏图层
    if (layerConfig.layer) {
      layerConfig.layer.setVisible(false)
    }
  }
}

const updateLayerOpacity = (layerConfig: ImageLayerConfig) => {
  if (layerConfig.layer) {
    layerConfig.layer.setOpacity(layerConfig.opacity / 100)
  }
}

const imageMetadata = ref<ImageMetadata | null>(null)

// ─── 行政区快速定位 ───────────────────────────────────────────────
const selectedRegion = ref<string[]>([])

const handleRegionChange = (val: any) => {
  if (!val || val.length === 0 || !map) return
  const regionValue = val[val.length - 1] // 取最后一级的值
  
  // 递归查找目标区域
  const findRegion = (regions: RegionItem[], target: string): RegionItem | null => {
    for (const region of regions) {
      if (region.value === target) return region
      if (region.children) {
        const found = findRegion(region.children, target)
        if (found) return found
      }
    }
    return null
  }
  
  const region = findRegion(CHINA_REGIONS, regionValue)
  if (region) {
    flyToRegion(map, region)
    ElMessage.success(`已定位至：${region.label}`)
  }
}

// ─── 第一层：不确定性可视化 ───────────────────────────────────────
const soilIndex = ref({
  value: 72.4,
  uncertainty: 3,
  confidenceText: '高',
  confidenceLevel: 'high',      // low / medium / high
  confidenceType: 'success' as const,
  confidencePct: 85,
  organicMatter: 42,
  waterContent: 31,
  terrainUndulation: 15,
  salinityFeature: 12,
  phLevel: '适中',
})

const confidenceBarColor = computed(() => {
  const lvl = soilIndex.value.confidenceLevel
  if (lvl === 'high') return '#00ffcc'
  if (lvl === 'medium') return '#e6a23c'
  return '#f56c6c'
})

// ─── 第一层：风险 × 可信度区域 ────────────────────────────────────
interface RiskZone {
  id: number
  label: string
  riskLevel: 'high' | 'medium' | 'low'
  riskText: string
  confidence: string
  hint: string
  action: string
  tagType: 'danger' | 'warning' | 'success'
  lonLat: [number, number]  // 真实经纬度坐标
  pixelPosition?: [number, number]  // 像素位置（动态计算）
}

const riskZones = ref<RiskZone[]>([
  {
    id: 1,
    label: '西北部盐渍化区',
    riskLevel: 'high',
    riskText: '高',
    confidence: '高',
    hint: '高风险 + 高可信，建议优先复核',
    action: '优先复核',
    tagType: 'danger',
    lonLat: [110.15, 29.35],  // 西北部位置
  },
  {
    id: 2,
    label: '中部有机质低洼区',
    riskLevel: 'medium',
    riskText: '中',
    confidence: '高',
    hint: '中风险 + 高可信，建议加强监测',
    action: '加强监测',
    tagType: 'warning',
    lonLat: [110.32, 29.24],  // 中部位置
  },
  {
    id: 3,
    label: '东南部优质耕地',
    riskLevel: 'low',
    riskText: '低',
    confidence: '高',
    hint: '低风险 + 高可信，可信度良好',
    action: '定期巡查',
    tagType: 'success',
    lonLat: [110.50, 29.05],  // 东南部位置
  },
])

const activeZone = ref<RiskZone | null>(null)
const reviewZoneCount = computed(() => riskZones.value.filter(z => z.riskLevel !== 'low').length)
const showWarningOverlay = ref(true)  // 警告覆盖层开关

const focusZone = (zone: RiskZone) => {
  if (map) {
    const view = map.getView()
    const mapCoord = lonLatToMapCoord(zone.lonLat)
    view.animate(
      { center: mapCoord, duration: 500 },
      { zoom: 13, duration: 500 }
    )
  }
  ElMessage.info(`已定位至：${zone.label}`)
}

// ─── 第二层：AI 自然语言解读 ──────────────────────────────────────
const aiConclusion = ref(
  '该区域土壤质量偏低，主要受盐分累积和地表水分不足共同影响。西北部存在轻度至中度盐渍化风险，建议及时采取土壤改良措施。'
)
const aiConfidenceLabel = ref('高')

// ─── 第二层：归因分析 ─────────────────────────────────────────────
const activeCollapse = ref<string[]>(['attribution'])
const activeFactorName = ref<string | null>(null)
const hoveredFactor = ref<{ name: string; hint: string } | null>(null)

const attributionFactors = ref([
  { name: '有机质含量', pct: 42, color: '#00ffcc', hint: '该因子在该区域异常偏低，影响最大' },
  { name: '土壤含水量', pct: 31, color: '#3b82f6', hint: '该因子在该区域偏低，旱情显著' },
  { name: '地形起伏', pct: 15, color: '#b794f6', hint: '该因子导致局部盐分聚集' },
  { name: '盐分特征', pct: 12, color: '#ff6b35', hint: '该因子在该区域异常偏高' },
])

const toggleFactor = (factor: { name: string }) => {
  activeFactorName.value = activeFactorName.value === factor.name ? null : factor.name
  // 实际项目中在此触发地图图层高亮
}

// ─── 第三层：决策建议 ─────────────────────────────────────────────
const decisionItems = ref([
  '建议短期内增加灌溉频率',
  '若连续两期指标异常，建议实地取样',
  '推荐监测周期：30 天',
])

const handleSuggestMeasures = () => {
  ElMessage.success('已生成建议措施清单')
}
const handleGenerateReport = () => {
  ElMessage.success('正在生成监测建议单...')
}
const handleMarkFocus = () => {
  ElMessage.warning('已标记为重点监测区域')
}

// ─── 更新告警点位置 ───────────────────────────────────────────────
const updateRiskZonePositions = () => {
  if (!map) return
  riskZones.value.forEach(zone => {
    const pixel = lonLatToPixel(map, zone.lonLat)
    if (pixel) {
      zone.pixelPosition = pixel
    }
  })
}

// ─── 地图与图表初始化 ─────────────────────────────────────────────
onMounted(async () => {
  await initMap()
  // 仪表盘在选择数据后才初始化
  // 检查是否从数据管理页面跳转过来
  if (route.query.showRGB === 'true' && inversionDataList.value.length > 0) {
    // 自动选择第一个数据
    selectedDataId.value = inversionDataList.value[0].id
    await handleDataSelect(selectedDataId.value)
  }
})

onUnmounted(() => {
  if (gaugeChart) {
    gaugeChart.dispose()
  }
  window.removeEventListener('resize', handleResize)
})

const initMap = async () => {
  if (mapContainer.value) {
    map = createBaseMap(mapContainer.value, mapStore.center, mapStore.zoom)
    
    // 监听地图移动，更新告警点位置
    map.on('moveend', updateRiskZonePositions)
    map.on('postrender', updateRiskZonePositions)
    
    // 初始化告警点位置
    updateRiskZonePositions()
  }
}

// ─── 加载遥感数据 ─────────────────────────────────────────────────
const loadRemoteSensingData = async () => {
  if (!hasSelectedData.value) {
    return
  }
  
  try {
    // 加载元数据
    const mtlUrl = '/demo_bundle/DZ01V_L2_E110.3_N29.2_20251225031144_01_T1_MTL.txt'
    const metadata = await parseMTLFile(mtlUrl)
    
    if (!metadata) {
      console.error('无法解析元数据')
      return
    }
    
    imageMetadata.value = metadata
    
    // 将地图视图移动到遥感图像区域
    if (map) {
      const view = map.getView()
      const centerCoord = lonLatToMapCoord(metadata.center)
      view.animate(
        { center: centerCoord, duration: 1000 },
        { zoom: 11, duration: 1000 }
      )
      
      // 检查路由参数，决定显示哪些图层
      const showRGB = route.query.showRGB === 'true'
      
      if (showRGB) {
        // 从数据管理页面跳转，显示原始RGB图像
        const rgbLayer = imageLayers.value.find(layer => layer.id === 'raw_rgb')
        if (rgbLayer) {
          rgbLayer.visible = true
          toggleLayer(rgbLayer)
        }
      } else {
        // 正常初始化，显示默认图层
        imageLayers.value.forEach(layer => {
          if (layer.visible) {
            toggleLayer(layer)
          }
        })
      }
      
      // ElMessage 移到 handleDataSelect 中统一显示
    }
  } catch (error) {
    console.error('加载遥感数据失败:', error)
    ElMessage.error('遥感数据加载失败')
  }
}

const handleResize = () => gaugeChart?.resize()

const initGaugeChart = () => {
  if (gaugeContainer.value) {
    gaugeChart = echarts.init(gaugeContainer.value)
    const option = createGaugeConfig(soilIndex.value.value, '综合指数', soilIndex.value.uncertainty)
    gaugeChart.setOption(option)
    window.addEventListener('resize', handleResize)
  }
}

const handleZoomIn = () => {
  if (map) {
    const view = map.getView()
    view.animate({ zoom: (view.getZoom() ?? 10) + 1, duration: 300 })
  }
}

const handleZoomOut = () => {
  if (map) {
    const view = map.getView()
    view.animate({ zoom: (view.getZoom() ?? 10) - 1, duration: 300 })
  }
}

const handleRefresh = () => {
  if (map) {
    map.getView().animate({ center: map.getView().getCenter(), zoom: mapStore.zoom, duration: 300 })
  }
}
</script>

<style lang="scss">
// 数据选择器下拉框全局样式（不能用scoped，否则会被限制作用域）
.data-select-popper {
  .el-select-dropdown__item {
    height: auto !important;
    min-height: 65px !important;
    padding: 10px 20px !important;
    line-height: 1.4 !important;
  }
}
</style>

<style scoped lang="scss">
// ═══════════════════════════════════════════════
//  整体布局
// ═══════════════════════════════════════════════
.home-page {
  height: calc(100vh - 100px);
  overflow: hidden; // 整体禁止滚动

  :deep(.el-row) {
    height: 100%;
  }

  :deep(.el-col) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.map-card {
  height: 100%;

  :deep(.el-card__body) {
    height: calc(100% - 60px);
    padding: 0;
    position: relative;
  }

  :deep(.el-card__header) {
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid $border-dark;
    color: $text-primary-dark;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: $text-primary-dark;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

// 数据选择框样式 + 内发光效果
.data-select {
  width: 280px;

  :deep(.el-input__wrapper) {
    background: rgba($neon-purple, 0.08);
    border: 1.5px solid rgba($neon-purple, 0.55);
    box-shadow: 
      0 0 8px rgba($neon-purple, 0.2),
      inset 0 0 12px rgba($neon-purple, 0.15) !important;
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
      border-color: $neon-purple;
      box-shadow: 
        0 0 12px rgba($neon-purple, 0.4),
        inset 0 0 16px rgba($neon-purple, 0.25) !important;
      background: rgba($neon-purple, 0.12);
    }

    &.is-focus {
      border-color: $neon-purple;
      box-shadow: 
        0 0 16px rgba($neon-purple, 0.5),
        inset 0 0 20px rgba($neon-purple, 0.3) !important;
      background: rgba($neon-purple, 0.12);
    }
  }

  :deep(.el-input__inner) {
    color: $neon-purple;
    font-size: 17px;
    font-weight: 500;
    letter-spacing: 0.3px;

    &::placeholder {
      color: rgba($neon-purple, 0.55);
    }
  }

  :deep(.el-icon) {
    color: $neon-purple;
    filter: drop-shadow(0 0 4px rgba($neon-purple, 0.8));
  }
}

// 数据选项样式
.data-option {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 0;

  .data-name {
    font-size: 16px;
    color: $text-primary-dark;
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 2px;
  }

  .data-id {
    display: inline-block;
    font-size: 12px;
    color: $success-color;
    background: rgba($success-color, 0.1);
    border: 1px solid rgba($success-color, 0.3);
    border-radius: 4px;
    padding: 3px 10px;
    font-family: 'Consolas', 'Monaco', monospace;
    letter-spacing: 0.5px;
    width: fit-content;
    line-height: 1.3;
  }
}

// 行政区级联选择框样式 + 内发光效果
.region-select {
  width: 260px;

  :deep(.el-input__wrapper) {
    background: rgba($neon-cyan, 0.08);
    border: 1.5px solid rgba($neon-cyan, 0.55);
    box-shadow: 
      0 0 8px rgba($neon-cyan, 0.2),
      inset 0 0 12px rgba($neon-cyan, 0.15) !important; // 内发光
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
      border-color: $neon-cyan;
      box-shadow: 
        0 0 12px rgba($neon-cyan, 0.4),
        inset 0 0 16px rgba($neon-cyan, 0.25) !important; // 内发光增强
      background: rgba($neon-cyan, 0.12);
    }

    &.is-focus {
      border-color: $neon-cyan;
      box-shadow: 
        0 0 16px rgba($neon-cyan, 0.5),
        inset 0 0 20px rgba($neon-cyan, 0.3) !important; // 内发光最强
      background: rgba($neon-cyan, 0.12);
    }
  }

  :deep(.el-input__inner) {
    color: $neon-cyan;
    font-size: 17px;
    font-weight: 500;
    letter-spacing: 0.3px;

    &::placeholder {
      color: rgba($neon-cyan, 0.55);
    }
  }

  :deep(.el-icon) {
    color: $neon-cyan;
    filter: drop-shadow(0 0 4px rgba($neon-cyan, 0.8));
  }
}

// ═══════════════════════════════════════════════
//  地图区域
// ═══════════════════════════════════════════════
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
  background-color: $map-bg-dark;
  border-radius: $border-radius-base;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}

// 顶部警告横幅
.map-alert-banner {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(28, 31, 34, 0.85);
  border: 1px solid rgba($neon-orange, 0.6);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 17px;
  color: $text-primary-dark;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 12px rgba($neon-orange, 0.3);
  white-space: nowrap;
  z-index: 10;

  strong {
    color: $neon-orange;
    margin: 0 2px;
  }

  .alert-icon {
    color: $neon-orange;
    filter: drop-shadow(0 0 4px $neon-orange);
  }
}

// 地图覆盖层（风险标注）
.map-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}

// 风险区域标注点 - 华丽版
.risk-zone-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: all;
  cursor: pointer;

  // 中心点容器
  .risk-zone-dot {
    position: relative;
    display: block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid;
    animation: pulse-ring 2s infinite, rotate-glow 4s linear infinite;

    // 内核光点
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: inner-pulse 1.5s infinite;
    }

    // 外围扩散层
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid;
      animation: expand-fade 2s infinite;
    }
  }

  &--high .risk-zone-dot {
    border-color: $danger-color;
    background: radial-gradient(circle, rgba($danger-color, 0.6), rgba($danger-color, 0.1));
    box-shadow: 
      0 0 15px rgba($danger-color, 0.8),
      0 0 30px rgba($danger-color, 0.5),
      0 0 45px rgba($danger-color, 0.3),
      inset 0 0 10px rgba($danger-color, 0.6);

    &::before {
      background: $danger-color;
    }

    &::after {
      border-color: $danger-color;
    }
  }

  &--medium .risk-zone-dot {
    border-color: $warning-color;
    background: radial-gradient(circle, rgba($warning-color, 0.6), rgba($warning-color, 0.1));
    box-shadow: 
      0 0 15px rgba($warning-color, 0.8),
      0 0 30px rgba($warning-color, 0.5),
      0 0 45px rgba($warning-color, 0.3),
      inset 0 0 10px rgba($warning-color, 0.6);

    &::before {
      background: $warning-color;
    }

    &::after {
      border-color: $warning-color;
    }
  }

  &--low .risk-zone-dot {
    border-color: $neon-cyan;
    background: radial-gradient(circle, rgba($neon-cyan, 0.6), rgba($neon-cyan, 0.1));
    box-shadow: 
      0 0 15px rgba($neon-cyan, 0.8),
      0 0 30px rgba($neon-cyan, 0.5),
      0 0 45px rgba($neon-cyan, 0.3),
      inset 0 0 10px rgba($neon-cyan, 0.6);

    &::before {
      background: $neon-cyan;
    }

    &::after {
      border-color: $neon-cyan;
    }
  }

  // Tooltip
  .risk-zone-tooltip {
    position: absolute;
    left: 24px;
    top: -8px;
    background: rgba(28, 31, 34, 0.95);
    border: 1px solid $border-dark-light;
    border-radius: $border-radius-large;
    padding: 10px 14px;
    width: 180px;
    font-size: 16px;
    color: $text-primary-dark;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
    z-index: 20;

    .tooltip-title {
      font-weight: 600;
      margin-bottom: 6px;
      color: $neon-cyan;
    }

    .tooltip-row {
      margin-bottom: 3px;
      color: $text-regular-dark;
    }

    .tooltip-hint {
      font-style: italic;
      color: $text-secondary-dark;
      margin-top: 4px;
    }
  }
}

// 告警点动画效果
@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.9;
  }
}

@keyframes rotate-glow {
  0% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(10deg) brightness(1.2); }
  100% { filter: hue-rotate(0deg) brightness(1); }
}

@keyframes inner-pulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.8;
  }
}

@keyframes expand-fade {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

// 风险等级文字颜色
.risk-text--high  { color: $danger-color; }
.risk-text--medium { color: $warning-color; }
.risk-text--low   { color: $neon-cyan; }

// ─── 图例
.legend-bar {
  display: flex;
  gap: 12px;
  font-size: 16px;
  color: $text-secondary-dark;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;

  &--low {
    background: $neon-cyan;
    box-shadow: 0 0 6px $neon-cyan;
  }

  &--high {
    background: repeating-linear-gradient(
      45deg,
      rgba($warning-color, 0.5),
      rgba($warning-color, 0.5) 2px,
      transparent 2px,
      transparent 4px
    );
    border: 1px solid $warning-color;
  }
}

// ═══════════════════════════════════════════════
//  右侧面板
// ═══════════════════════════════════════════════
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0; // 修复 flex 容器中的滚动问题
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px; // 为滚动条留空间
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba($border-dark, 0.3);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: $border-dark;
    border-radius: 3px;
    
    &:hover {
      background: lighten($border-dark, 10%);
    }
  }
}

// ─── 暂无数据占位
.no-data-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;

  :deep(.el-empty) {
    padding: 40px 20px;
  }

  .empty-title {
    font-size: 20px;
    color: $text-primary-dark;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .empty-hint {
    font-size: 16px;
    color: $text-secondary-dark;
    line-height: 1.6;
    max-width: 280px;
    margin: 0 auto;
  }
}

// ─── 综合指数卡片
.index-card {
  flex-shrink: 0;

  :deep(.el-card__body) {
    background: radial-gradient(circle at center, rgba(37, 40, 43, 0.8), rgba(28, 31, 34, 0.95));
    padding: 14px;
  }
}

.index-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.index-stats {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.index-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.index-label {
  font-size: 16px;
  color: $text-secondary-dark;
}

.index-value {
  font-size: 32px;
  font-weight: 700;
  color: $neon-cyan;
  text-shadow: 0 0 10px rgba($neon-cyan, 0.6);
  line-height: 1;
}

.confidence-tag {
  font-size: 15px;
}

.index-sub-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  color: $text-secondary-dark;

  .sub-label {
    color: $text-secondary-dark;
  }

  .sub-value {
    color: $text-regular-dark;

    &.success { color: $success-color; }
    &.warning { color: $warning-color; }
  }
}

.confidence-bar-wrap {
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .confidence-label {
    font-size: 16px;
    color: $text-secondary-dark;
    white-space: nowrap;
  }

  .confidence-progress {
    flex: 1;
    
    :deep(.el-progress-bar__outer) {
      background: rgba(255, 255, 255, 0.08);
    }
  }
}

.confidence-text--high   { color: $neon-cyan; }
.confidence-text--medium { color: $warning-color; }
.confidence-text--low    { color: $danger-color; }

.chart-container {
  width: 100%;
  height: 180px;
  flex-shrink: 0;
}

// ─── 复核建议卡片
.review-card {
  flex-shrink: 0;

  :deep(.el-card__header) {
    border-bottom: 1px solid rgba($warning-color, 0.3);
  }

  .warn-icon {
    color: $warning-color;
    margin-right: 4px;
    vertical-align: middle;
  }
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: $transition-glow;
  border: 1px solid transparent;

  &--high {
    background: rgba($danger-color, 0.06);
    &:hover { border-color: rgba($danger-color, 0.4); background: rgba($danger-color, 0.1); }
  }

  &--medium {
    background: rgba($warning-color, 0.06);
    &:hover { border-color: rgba($warning-color, 0.4); background: rgba($warning-color, 0.1); }
  }

  &--low {
    background: rgba($neon-cyan, 0.04);
    &:hover { border-color: rgba($neon-cyan, 0.3); }
  }
}

.review-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &--high   { background: $danger-color; box-shadow: 0 0 6px $danger-color; }
  &--medium { background: $warning-color; box-shadow: 0 0 6px $warning-color; }
  &--low    { background: $neon-cyan; box-shadow: 0 0 6px $neon-cyan; }
}

.review-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.review-name {
  font-size: 17px;
  color: $text-primary-dark;
}

.review-desc {
  font-size: 15px;
  color: $text-secondary-dark;
}

.review-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  color: $warning-color;
  margin-top: 4px;
  padding: 6px 8px;
  background: rgba($warning-color, 0.08);
  border-radius: $border-radius-base;
  border-left: 3px solid $warning-color;
}

// ─── AI 解读卡片
.ai-card {
  flex-shrink: 0;

  :deep(.el-card__body) {
    height: auto;
    overflow: visible;
    padding: 14px;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: $border-dark; border-radius: 2px; }
  }
}

.ai-mode-switch {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ai-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// 自然语言块
.ai-nl-block {
  background: rgba(37, 40, 43, 0.8);
  border: 1px solid $border-dark;
  border-left: 3px solid $neon-purple;
  border-radius: $border-radius-base;
  padding: 10px 14px;
  box-shadow: -2px 0 10px rgba($neon-purple, 0.2);
}

.ai-conclusion {
  font-size: 17px;
  line-height: 1.8;
  color: $text-regular-dark;
}

.ai-confidence-tip {
  font-size: 16px;
  color: $text-secondary-dark;
  margin-top: 6px;
}

// 归因折叠
.attribution-collapse {
  border: 1px solid $border-dark;
  border-radius: $border-radius-base;
  overflow: hidden;

  :deep(.el-collapse-item__header) {
    background: rgba(37, 40, 43, 0.6);
    color: $text-primary-dark;
    border-bottom: 1px solid $border-dark;
    font-size: 13px;
    padding: 0 12px;

    &.is-active {
      color: $neon-cyan;
    }
  }

  :deep(.el-collapse-item__content) {
    background: rgba(28, 31, 34, 0.6);
    padding: 10px 12px;
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: none;
  }

  :deep(.el-collapse-item) {
    border-bottom: 1px solid $border-dark;
    &:last-child { border-bottom: none; }
  }
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 17px;

  .el-icon {
    color: $neon-cyan;
    filter: drop-shadow(0 0 3px $neon-cyan);
  }
}

// 归因列表
.attribution-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attribution-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: $transition-glow;
  border: 1px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: $border-dark;
  }

  &.is-active {
    background: rgba($neon-cyan, 0.06);
    border-color: rgba($neon-cyan, 0.3);
  }
}

.attr-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.attr-check {
  color: $neon-cyan;
  font-size: 18px;
  flex-shrink: 0;
}

.attr-name {
  font-size: 16px;
  color: $text-regular-dark;
}

.attr-hint {
  font-size: 15px;
  color: $text-secondary-dark;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.attr-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.attr-pct {
  font-size: 16px;
  color: $text-secondary-dark;
  width: 32px;
  text-align: right;
}

.attr-map-hint {
  font-size: 15px;
  color: $neon-cyan;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  padding: 4px 8px;
  background: rgba($neon-cyan, 0.06);
  border-radius: $border-radius-base;
}

// 决策建议
.decision-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.decision-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  li {
    font-size: 16px;
    color: $text-regular-dark;
    line-height: 1.7;

    &::marker {
      color: $neon-cyan;
    }
  }
}

.decision-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

// AI + 专家协同入口
.expert-mode-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: rgba(37, 40, 43, 0.6);
  border: 1px solid $border-dark;
  border-radius: $border-radius-base;
}

.expert-mode-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  color: $text-secondary-dark;

  strong {
    color: $neon-cyan;
  }

  .el-icon {
    color: $text-secondary-dark;
  }
}

.expert-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.coming-tag {
  margin-left: 4px;
  font-size: 14px;
}

.expert-note {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
  color: $text-secondary-dark;
  font-style: italic;

  .el-icon {
    color: $info-color;
  }
}

// ═══════════════════════════════════════════════
//  图层控制面板
// ═══════════════════════════════════════════════
.layer-control-panel {
  max-height: 500px;
  overflow-y: auto;
  padding: 0;
}

.layer-control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid $border-dark;
  background: rgba($neon-cyan, 0.05);

  span {
    font-weight: 600;
    color: $text-primary-dark;
    font-size: 18px;
  }
}

.layer-list {
  padding: 8px;
}

.layer-item {
  padding: 12px;
  border-radius: $border-radius-base;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid $border-dark;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba($neon-cyan, 0.05);
    border-color: rgba($neon-cyan, 0.3);
    box-shadow: 0 0 8px rgba($neon-cyan, 0.2);
  }
}

.layer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.layer-name {
  flex: 1;
  font-size: 17px;
  color: $text-primary-dark;
  font-weight: 500;
  cursor: help;
  transition: color 0.2s ease;

  &:hover {
    color: $neon-cyan;
  }
}

.layer-opacity {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 32px;

  .opacity-label {
    font-size: 16px;
    color: $text-secondary-dark;
    white-space: nowrap;
  }

  .el-slider {
    flex: 1;
    
    :deep(.el-slider__runway) {
      background: rgba($neon-cyan, 0.1);
      height: 4px;
    }

    :deep(.el-slider__bar) {
      background: linear-gradient(90deg, $neon-cyan, darken($neon-cyan, 10%));
    }

    :deep(.el-slider__button) {
      border-color: $neon-cyan;
      background: $neon-cyan;
      width: 12px;
      height: 12px;
    }
  }

  .opacity-value {
    font-size: 16px;
    color: $neon-cyan;
    font-weight: 600;
    min-width: 36px;
    text-align: right;
  }
}

</style>
