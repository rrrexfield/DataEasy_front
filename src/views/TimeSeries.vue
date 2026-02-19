<template>
  <div class="time-series-page">
    <el-card shadow="never" style="height: 100%">
      <template #header>
        <div class="card-header">
          <span>时序变化分析</span>
          <el-space>
            <el-select v-model="selectedIndicator" placeholder="选择指标" style="width: 150px">
              <el-option label="有机质" value="organicMatter" />
              <el-option label="含水量" value="waterContent" />
              <el-option label="盐渍化" value="salinization" />
            </el-select>
            <el-button type="primary" :icon="DataAnalysis">分析</el-button>
          </el-space>
        </div>
      </template>

      <!-- 时间轴控制 -->
      <div class="timeline-control">
        <div class="timeline-header">
          <span class="current-date">{{ currentDate }}</span>
          <el-space>
            <el-button :icon="VideoPlay" @click="handlePlay">{{ isPlaying ? '暂停' : '播放' }}</el-button>
            <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
          </el-space>
        </div>

        <el-slider
          v-model="timelineIndex"
          :max="timelineData.length - 1"
          :marks="timelineMarks"
          :format-tooltip="formatTooltip"
          @change="handleTimelineChange"
        />
      </div>

      <!-- 地图对比视图 -->
      <div class="map-comparison">
        <div class="map-item">
          <div class="map-title">当前时间: {{ currentDate }}</div>
          <div ref="mapContainer1" class="map-container"></div>
        </div>

        <div class="map-item">
          <div class="map-title">对比时间: {{ compareDate }}</div>
          <div ref="mapContainer2" class="map-container"></div>
        </div>
      </div>

      <!-- 趋势图表 -->
      <div class="trend-chart">
        <div ref="chartContainer" class="chart-container"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { DataAnalysis, VideoPlay, RefreshRight } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { createBaseMap } from '@/utils/map-utils'
import { createLineConfig } from '@/utils/chart-config'

const selectedIndicator = ref('organicMatter')
const timelineIndex = ref(0)
const isPlaying = ref(false)
let playInterval: any = null

const mapContainer1 = ref<HTMLElement>()
const mapContainer2 = ref<HTMLElement>()
const chartContainer = ref<HTMLElement>()

let lineChart: echarts.ECharts | null = null

// 时序数据
const timelineData = [
  '2024-01-15',
  '2024-02-15',
  '2024-03-15',
  '2024-04-15',
  '2024-05-15',
  '2024-06-15',
]

const timelineMarks = computed(() => {
  const marks: Record<number, string> = {}
  timelineData.forEach((date, index) => {
    if (index % 2 === 0) {
      marks[index] = date.substring(5)
    }
  })
  return marks
})

const currentDate = computed(() => timelineData[timelineIndex.value])
const compareDate = computed(() => {
  const compareIndex = Math.max(0, timelineIndex.value - 1)
  return timelineData[compareIndex]
})

onMounted(() => {
  initMaps()
  initLineChart()
})

onUnmounted(() => {
  if (lineChart) {
    lineChart.dispose()
  }
  if (playInterval) {
    clearInterval(playInterval)
  }
})

const initMaps = () => {
  if (mapContainer1.value) {
    createBaseMap(mapContainer1.value, [116.3, 39.9], 10)
  }
  if (mapContainer2.value) {
    createBaseMap(mapContainer2.value, [116.3, 39.9], 10)
  }
}

const initLineChart = () => {
  if (chartContainer.value) {
    lineChart = echarts.init(chartContainer.value)
    const option = createLineConfig(
      timelineData.map(d => d.substring(5)),
      [
        {
          name: '有机质',
          data: [45, 48, 52, 50, 55, 58],
        },
        {
          name: '含水量',
          data: [30, 32, 28, 35, 33, 36],
        },
      ],
      '土壤指标时序变化趋势'
    )
    lineChart.setOption(option)

    window.addEventListener('resize', () => {
      lineChart?.resize()
    })
  }
}

const formatTooltip = (index: number) => {
  return timelineData[index]
}

const handleTimelineChange = (value: number) => {
  // 更新地图显示
  console.log('时间轴变化:', timelineData[value])
}

const handlePlay = () => {
  if (isPlaying.value) {
    clearInterval(playInterval)
    isPlaying.value = false
  } else {
    isPlaying.value = true
    playInterval = setInterval(() => {
      if (timelineIndex.value >= timelineData.length - 1) {
        timelineIndex.value = 0
      } else {
        timelineIndex.value++
      }
    }, 2000)
  }
}

const handleReset = () => {
  timelineIndex.value = 0
  if (playInterval) {
    clearInterval(playInterval)
    isPlaying.value = false
  }
}
</script>

<style scoped lang="scss">
.time-series-page {
  height: calc(100vh - 100px);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.timeline-control {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .current-date {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.map-comparison {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  height: 400px;

  .map-item {
    flex: 1;
    display: flex;
    flex-direction: column;

    .map-title {
      padding: 10px;
      background-color: #f5f7fa;
      text-align: center;
      font-weight: 600;
      border-radius: 4px 4px 0 0;
    }

    .map-container {
      flex: 1;
      background-color: #1a1a1a;
      border-radius: 0 0 4px 4px;
    }
  }
}

.trend-chart {
  height: 300px;

  .chart-container {
    width: 100%;
    height: 100%;
  }
}
</style>
