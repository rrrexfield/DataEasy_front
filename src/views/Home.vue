<template>
  <div class="home-page">
    <el-row :gutter="20" style="height: 100%">
      <!-- 中央地图区域 -->
      <el-col :span="16">
        <el-card class="map-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>研究区地图 - 土壤质量综合指数热力图</span>
              <el-button-group>
                <el-button size="small" :icon="ZoomIn" @click="handleZoomIn" />
                <el-button size="small" :icon="ZoomOut" @click="handleZoomOut" />
                <el-button size="small" :icon="RefreshRight" @click="handleRefresh" />
              </el-button-group>
            </div>
          </template>
          <div ref="mapContainer" class="map-container"></div>
        </el-card>
      </el-col>

      <!-- 右侧结果栏 -->
      <el-col :span="8">
        <div class="right-panel">
          <!-- 综合指数评分 -->
          <el-card class="index-card" shadow="never">
            <template #header>
              <span>土壤质量综合指数</span>
            </template>
            <div ref="gaugeContainer" class="chart-container"></div>
          </el-card>

          <!-- AI 自动解读 -->
          <el-card class="ai-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>AI 自动解读</span>
                <el-tag type="success" size="small">
                  <el-icon><CircleCheck /></el-icon>
                  已完成
                </el-tag>
              </div>
            </template>
            <div class="ai-content">
              <el-alert
                type="info"
                :closable="false"
                show-icon
              >
                <template #title>
                  <div class="ai-conclusion">
                    {{ aiConclusion }}
                  </div>
                </template>
              </el-alert>

              <div class="ai-details">
                <h4>关键指标:</h4>
                <el-space wrap>
                  <el-tag v-for="indicator in keyIndicators" :key="indicator.name" :type="indicator.type">
                    {{ indicator.name }}: {{ indicator.value }}
                  </el-tag>
                </el-space>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ZoomIn, ZoomOut, RefreshRight, CircleCheck } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { createBaseMap } from '@/utils/map-utils'
import { createGaugeConfig } from '@/utils/chart-config'
import { useMapStore } from '@/stores'

const mapStore = useMapStore()

const mapContainer = ref<HTMLElement>()
const gaugeContainer = ref<HTMLElement>()
let map: any = null
let gaugeChart: echarts.ECharts | null = null

const aiConclusion = ref('该区域整体土壤质量中等偏好,西北部存在轻度盐渍化风险。建议加强监测和土壤改良措施。')
const keyIndicators = ref<Array<{ name: string; value: string; type: 'success' | 'warning' | 'danger' | 'info' }>>([
  { name: '有机质', value: '中等', type: 'success' },
  { name: '含水量', value: '适中', type: 'success' },
  { name: '盐渍化', value: '轻度', type: 'warning' },
])

onMounted(() => {
  initMap()
  initGaugeChart()
})

onUnmounted(() => {
  if (gaugeChart) {
    gaugeChart.dispose()
  }
})

const initMap = () => {
  if (mapContainer.value) {
    map = createBaseMap(mapContainer.value, mapStore.center, mapStore.zoom)
  }
}

const initGaugeChart = () => {
  if (gaugeContainer.value) {
    gaugeChart = echarts.init(gaugeContainer.value)
    const option = createGaugeConfig(72, '综合指数')
    gaugeChart.setOption(option)

    // 响应式调整
    window.addEventListener('resize', () => {
      gaugeChart?.resize()
    })
  }
}

const handleZoomIn = () => {
  if (map) {
    const view = map.getView()
    const zoom = view.getZoom()
    view.animate({ zoom: zoom + 1, duration: 300 })
  }
}

const handleZoomOut = () => {
  if (map) {
    const view = map.getView()
    const zoom = view.getZoom()
    view.animate({ zoom: zoom - 1, duration: 300 })
  }
}

const handleRefresh = () => {
  if (map) {
    map.getView().animate({ 
      center: map.getView().getCenter(), 
      zoom: mapStore.zoom,
      duration: 300 
    })
  }
}
</script>

<style scoped lang="scss">
.home-page {
  height: calc(100vh - 100px);
}

.map-card {
  height: 100%;
  
  // 使用 theme.scss 的卡片样式
  :deep(.el-card__body) {
    height: calc(100% - 60px);
    padding: 0;
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

.map-container {
  width: 100%;
  height: 100%;
  background-color: $map-bg-dark;
  border-radius: $border-radius-base;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.index-card {
  height: 320px;

  :deep(.el-card__body) {
    height: calc(100% - 60px);
    background: radial-gradient(
      circle at center,
      rgba(26, 26, 26, 0.8),
      rgba(15, 15, 15, 0.95)
    );
  }
}

.chart-container {
  width: 100%;
  height: 100%;
}

.ai-card {
  flex: 1;

  :deep(.el-card__body) {
    height: calc(100% - 60px);
  }
}

.ai-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ai-conclusion {
  font-size: 14px;
  line-height: 1.8;
  color: $text-regular-dark;
}

.ai-details {
  h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: $text-primary-dark;
    text-transform: uppercase;
    letter-spacing: 1px;
    @include text-glow($neon-cyan, low);
  }
  
  // 标签样式由 theme.scss 统一处理
}

// AI 卡片左侧发光边框
.ai-card {
  :deep(.el-alert) {
    background-color: rgba(26, 26, 26, 0.8);
    border: 1px solid $border-dark;
    border-left: 3px solid $neon-purple;
    box-shadow: -2px 0 10px rgba($neon-purple, 0.3);
    color: $text-primary-dark;
    
    .el-alert__icon {
      color: $neon-purple;
      filter: drop-shadow(0 0 5px rgba($neon-purple, 0.8));
    }
  }
}
</style>
