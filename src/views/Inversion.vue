<template>
  <div class="inversion-page">
    <el-row :gutter="20" style="height: 100%">
      <!-- 左侧参数设置 -->
      <el-col :span="5">
        <el-card shadow="never" class="param-card">
          <template #header>
            <span>参数设置</span>
          </template>

          <el-form :model="inversionForm" label-width="80px" label-position="top">
            <el-form-item label="指标类型">
              <el-select v-model="inversionForm.indicator" placeholder="请选择指标" style="width: 100%">
                <el-option label="土壤有机碳 (OC)" value="OC" />
                <el-option label="全氮 (TN)" value="TN" />
                <el-option label="全磷 (TP)" value="TP" />
                <el-option label="土壤含水量" value="waterContent" />
                <el-option label="植被指数 (NDVI)" value="NDVI" />
              </el-select>
            </el-form-item>

            <el-form-item label="研究区域">
              <el-cascader
                v-model="inversionForm.region"
                placeholder="选择行政区定位"
                clearable
                filterable
                :options="CHINA_REGIONS as any"
                :props="{ checkStrictly: true, expandTrigger: 'hover', value: 'value', label: 'label' }"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="数据源">
              <el-select v-model="inversionForm.dataSource" placeholder="请选择数据源" style="width: 100%">
                <el-option label="DZ01V_张家界_2025-12-25" value="e4a7b9c2f6d1" />
                <el-option label="高光谱_2024Q1" value="9f2d4e8a1c5b" />
                <el-option label="DEM地形_2024" value="7c3a8d5e2f9b" />
              </el-select>
            </el-form-item>

            <el-form-item label="算法模型">
              <el-select v-model="inversionForm.model" placeholder="请选择模型" style="width: 100%">
                <el-option label="随机森林" value="rf" />
                <el-option label="支持向量机" value="svm" />
                <el-option label="深度学习" value="dl" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" style="width: 100%" :loading="isAnalyzing" @click="handleStartInversion">
                <el-icon v-if="!isAnalyzing"><MagicStick /></el-icon>
                {{ isAnalyzing ? 'AI 反演中...' : '开始反演' }}
              </el-button>
            </el-form-item>

            <!-- 进度条 -->
            <el-progress v-if="isAnalyzing" :percentage="progress" :color="progressColor" />
          </el-form>
        </el-card>
      </el-col>

      <!-- 中央地图区 -->
      <el-col :span="12">
        <el-card shadow="never" class="map-card">
          <template #header>
            <div class="card-header">
              <span>反演结果空间分布图</span>
              <el-radio-group v-model="displayMode" size="small">
                <el-radio-button label="分级色斑" />
                <el-radio-button label="连续渲染" />
              </el-radio-group>
            </div>
          </template>

          <div v-if="!hasResult" class="empty-container">
            <el-empty description="请选择参数并开始反演分析" />
          </div>
          <div v-else ref="mapContainer" class="map-container"></div>
        </el-card>
      </el-col>

      <!-- 右侧统计信息 -->
      <el-col :span="7">
        <div class="stats-panel">
          <el-card shadow="never" class="stats-card">
            <template #header>
              <span>统计信息</span>
            </template>

            <div v-if="hasResult" class="stats-content">
              <div class="stat-item">
                <span class="label">指标名称:</span>
                <span class="value primary">{{ indicatorConfig[inversionForm.indicator]?.label || '-' }}</span>
              </div>
              <div class="stat-item">
                <span class="label">单位:</span>
                <span class="value">{{ indicatorConfig[inversionForm.indicator]?.unit || '-' }}</span>
              </div>
              <div class="stat-item">
                <span class="label">均值:</span>
                <span class="value">{{ statistics.mean }} {{ indicatorConfig[inversionForm.indicator]?.unit }}</span>
              </div>
              <div class="stat-item">
                <span class="label">中位数:</span>
                <span class="value">{{ statistics.median }} {{ indicatorConfig[inversionForm.indicator]?.unit }}</span>
              </div>
              <div class="stat-item">
                <span class="label">最大值:</span>
                <span class="value success">{{ statistics.max }} {{ indicatorConfig[inversionForm.indicator]?.unit }}</span>
              </div>
              <div class="stat-item">
                <span class="label">最小值:</span>
                <span class="value warning">{{ statistics.min }} {{ indicatorConfig[inversionForm.indicator]?.unit }}</span>
              </div>
              <div class="stat-item">
                <span class="label">标准差:</span>
                <span class="value">{{ statistics.std }} {{ indicatorConfig[inversionForm.indicator]?.unit }}</span>
              </div>
              <div class="stat-item">
                <span class="label">变异系数:</span>
                <span class="value">{{ statistics.cv }}%</span>
              </div>
            </div>
            <el-empty v-else description="暂无数据" :image-size="80" />
          </el-card>

          <el-card shadow="never" class="chart-card">
            <template #header>
              <span>等级占比分布</span>
            </template>

            <div v-if="hasResult" ref="chartContainer" class="chart-container"></div>
            <el-empty v-else description="暂无数据" :image-size="80" />
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { createBaseMap, CHINA_REGIONS, addRemoteSensingImage } from '@/utils/map-utils'
import { createBarConfig } from '@/utils/chart-config'

const inversionForm = reactive({
  indicator: 'OC',
  region: [] as string[],
  dataSource: '',
  model: 'rf',
})

const isAnalyzing = ref(false)
const progress = ref(0)
const hasResult = ref(false)
const displayMode = ref('分级色斑')

const mapContainer = ref<HTMLElement>()
const chartContainer = ref<HTMLElement>()
let map: any = null
let currentLayer: any = null
let barChart: echarts.ECharts | null = null

const statistics = reactive({
  mean: 0,
  max: 0,
  min: 0,
  std: 0,
  median: 0,
  cv: 0,
})

// 指标配置信息
const indicatorConfig: Record<string, any> = {
  OC: {
    label: '土壤有机碳',
    unit: 'g/kg',
    mean: 18.5,
    max: 45.2,
    min: 5.3,
    std: 8.6,
    median: 16.8,
    cv: 46.5,
    levels: ['非常高', '高', '中等', '低', '非常低'],
    distribution: [12, 28, 35, 20, 5],
  },
  TN: {
    label: '土壤全氮',
    unit: 'g/kg',
    mean: 1.45,
    max: 3.2,
    min: 0.4,
    std: 0.62,
    median: 1.38,
    cv: 42.8,
    levels: ['非常高', '高', '中等', '低', '非常低'],
    distribution: [8, 25, 40, 22, 5],
  },
  TP: {
    label: '土壤全磷',
    unit: 'g/kg',
    mean: 0.85,
    max: 1.8,
    min: 0.2,
    std: 0.38,
    median: 0.79,
    cv: 44.7,
    levels: ['非常高', '高', '中等', '低', '非常低'],
    distribution: [10, 22, 38, 25, 5],
  },
  waterContent: {
    label: '土壤含水量',
    unit: '%',
    mean: 31,
    max: 62,
    min: 8,
    std: 12.5,
    median: 29,
    cv: 40.3,
    levels: ['很湿润', '湿润', '适宜', '干燥', '很干燥'],
    distribution: [15, 30, 35, 15, 5],
  },
  NDVI: {
    label: '植被指数',
    unit: '',
    mean: 0.65,
    max: 0.92,
    min: 0.15,
    std: 0.18,
    median: 0.68,
    cv: 27.7,
    levels: ['密集植被', '丰富植被', '中等植被', '稀疏植被', '无植被'],
    distribution: [18, 32, 30, 15, 5],
  },
}

const progressColor = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#6f7ad3', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#5cb87a', percentage: 100 },
]

onMounted(() => {
  // 图表会在反演完成后初始化
})

onUnmounted(() => {
  if (barChart) {
    barChart.dispose()
  }
  if (map) {
    map.setTarget(null)
    map = null
  }
})

const handleStartInversion = () => {
  if (!inversionForm.region || inversionForm.region.length === 0 || !inversionForm.dataSource) {
    ElMessage.warning('请选择研究区域和数据源')
    return
  }

  isAnalyzing.value = true
  progress.value = 0

  // 模拟进度
  const interval = setInterval(() => {
    progress.value += 10
    if (progress.value >= 100) {
      clearInterval(interval)
      isAnalyzing.value = false
      hasResult.value = true
      
      // 更新统计信息
      updateStatistics()
      
      ElMessage.success(`${indicatorConfig[inversionForm.indicator]?.label || '指标'}反演完成！`)

      // 初始化地图和图表
      setTimeout(() => {
        initMap()
        initBarChart()
      }, 100)
    }
  }, 500)
}

const updateStatistics = () => {
  const config = indicatorConfig[inversionForm.indicator]
  if (config) {
    statistics.mean = config.mean
    statistics.max = config.max
    statistics.min = config.min
    statistics.std = config.std
    statistics.median = config.median
    statistics.cv = config.cv
  }
}

const initMap = () => {
  if (!mapContainer.value) return
  
  // 如果选择的是张家界数据，定位到张家界
  let center: [number, number] = [116.3, 39.9]
  let zoom = 10
  
  if (inversionForm.dataSource === 'e4a7b9c2f6d1') {
    // 张家界数据
    center = [110.3, 29.2]
    zoom = 11
  }
  
  // 如果地图已经存在，只更新图层，不重新创建地图
  if (map) {
    // 移除旧图层
    if (currentLayer) {
      map.removeLayer(currentLayer)
      currentLayer = null
    }
  } else {
    // 创建新地图
    map = createBaseMap(mapContainer.value, center, zoom)
  }
  
  // 如果是张家界数据，加载遥感图层
  if (inversionForm.dataSource === 'e4a7b9c2f6d1') {
    const extent: [number, number, number, number] = [
      110.15, 29.05,  // 左下角 [minLon, minLat]
      110.45, 29.35   // 右上角 [maxLon, maxLat]
    ]
    
    // 根据选择的指标加载对应的预测图
    let imageUrl = '/demo_bundle/results/pred_OC_0-5cm_1km_mean_preview.png'
    if (inversionForm.indicator === 'TN') {
      imageUrl = '/demo_bundle/results/pred_TN_0-5cm_1km_mean_preview.png'
    } else if (inversionForm.indicator === 'TP') {
      imageUrl = '/demo_bundle/results/pred_TP_0-5cm_1km_mean_preview.png'
    } else if (inversionForm.indicator === 'NDVI') {
      imageUrl = '/demo_bundle/processed/ndvi_preview.png'
    }
    
    setTimeout(() => {
      currentLayer = addRemoteSensingImage(map, imageUrl, extent, 0.7)
    }, 100)
  }
}

const initBarChart = () => {
  if (!chartContainer.value) return
  
  // 如果图表已经存在，只更新数据
  if (barChart) {
    const config = indicatorConfig[inversionForm.indicator]
    const option = createBarConfig(
      config?.levels || ['优秀', '良好', '中等', '较差', '退化'],
      config?.distribution || [25, 35, 20, 15, 5],
      ''
    )
    barChart.setOption(option)
  } else {
    // 创建新图表
    barChart = echarts.init(chartContainer.value)
    
    const config = indicatorConfig[inversionForm.indicator]
    const option = createBarConfig(
      config?.levels || ['优秀', '良好', '中等', '较差', '退化'],
      config?.distribution || [25, 35, 20, 15, 5],
      ''
    )
    barChart.setOption(option)

    window.addEventListener('resize', () => {
      barChart?.resize()
    })
  }
}
</script>

<style scoped lang="scss">
.inversion-page {
  height: calc(100vh - 100px);
}

.param-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-card {
  height: 100%;

  :deep(.el-card__body) {
    height: calc(100% - 60px);
  }
}

.map-container {
  width: 100%;
  height: 100%;
  background-color: #25282B;
}

.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.stats-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.stats-card {
  .stats-content {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid $border-dark;
      border-radius: $border-radius-base;
      transition: all 0.3s ease;

      &:hover {
        background: rgba($neon-cyan, 0.05);
        border-color: rgba($neon-cyan, 0.3);
      }

      .label {
        color: $text-secondary-dark;
        font-size: 15px;
      }

      .value {
        font-weight: 600;
        color: $text-primary-dark;
        font-size: 16px;

        &.primary {
          color: $neon-cyan;
          text-shadow: 0 0 6px rgba($neon-cyan, 0.5);
        }

        &.success {
          color: $success-color;
        }

        &.warning {
          color: $warning-color;
        }
      }
    }
  }
}

.chart-card {
  flex: 1;

  :deep(.el-card__body) {
    height: calc(100% - 60px);
  }
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>
