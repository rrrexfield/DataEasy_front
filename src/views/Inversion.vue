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
                <el-option label="有机质" value="organicMatter" />
                <el-option label="含水量" value="waterContent" />
                <el-option label="盐渍化" value="salinization" />
              </el-select>
            </el-form-item>

            <el-form-item label="研究区域">
              <el-select v-model="inversionForm.studyArea" placeholder="请选择研究区" style="width: 100%">
                <el-option label="研究区A" value="area-a" />
                <el-option label="研究区B" value="area-b" />
              </el-select>
            </el-form-item>

            <el-form-item label="数据源">
              <el-select v-model="inversionForm.dataSource" placeholder="请选择数据源" style="width: 100%">
                <el-option label="2024-03-15" value="data-001" />
                <el-option label="2024-03-10" value="data-002" />
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
                <span class="label">均值:</span>
                <span class="value">{{ statistics.mean }}</span>
              </div>
              <div class="stat-item">
                <span class="label">最大值:</span>
                <span class="value">{{ statistics.max }}</span>
              </div>
              <div class="stat-item">
                <span class="label">最小值:</span>
                <span class="value">{{ statistics.min }}</span>
              </div>
              <div class="stat-item">
                <span class="label">标准差:</span>
                <span class="value">{{ statistics.std }}</span>
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
import { createBaseMap } from '@/utils/map-utils'
import { createBarConfig } from '@/utils/chart-config'

const inversionForm = reactive({
  indicator: 'organicMatter',
  studyArea: '',
  dataSource: '',
  model: 'rf',
})

const isAnalyzing = ref(false)
const progress = ref(0)
const hasResult = ref(false)
const displayMode = ref('分级色斑')

const mapContainer = ref<HTMLElement>()
const chartContainer = ref<HTMLElement>()
let barChart: echarts.ECharts | null = null

const statistics = reactive({
  mean: 45.8,
  max: 89.2,
  min: 12.3,
  std: 15.6,
})

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
})

const handleStartInversion = () => {
  if (!inversionForm.studyArea || !inversionForm.dataSource) {
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
      ElMessage.success('反演完成!')

      // 初始化地图和图表
      setTimeout(() => {
        initMap()
        initBarChart()
      }, 100)
    }
  }, 500)
}

const initMap = () => {
  if (mapContainer.value) {
    createBaseMap(mapContainer.value, [116.3, 39.9], 10)
  }
}

const initBarChart = () => {
  if (chartContainer.value) {
    barChart = echarts.init(chartContainer.value)
    const option = createBarConfig(
      ['优秀', '良好', '中等', '较差', '退化'],
      [25, 35, 20, 15, 5],
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
  background-color: #1a1a1a;
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
    gap: 15px;

    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background-color: #f5f7fa;
      border-radius: 4px;

      .label {
        color: #606266;
      }

      .value {
        font-weight: 600;
        color: #303133;
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
