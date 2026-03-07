<template>
  <div class="inversion-page">
    <van-nav-bar
      :title="activeMode === 'single' ? '指标反演' : '时序分析'"
      fixed
      placeholder
    >
      <template #right>
        <van-popover
          v-model:show="showModeMenu"
          :actions="modeActions"
          placement="bottom-end"
          @select="handleModeSelect"
        >
          <template #reference>
            <van-button
              size="small"
              type="primary"
              plain
              class="mode-switch-btn"
            >
              {{ activeModeLabel }}
              <van-icon name="arrow-down" />
            </van-button>
          </template>
        </van-popover>
      </template>
    </van-nav-bar>

    <div class="page-content">
      <template v-if="activeMode === 'single'">
        <van-form @submit="handleStartInversion">
          <van-cell-group title="参数设置" inset>
            <van-field
              v-model="indicatorText"
              is-link
              readonly
              label="指标类型"
              placeholder="请选择指标"
              @click="showIndicatorPicker = true"
            />
            <van-popup v-model:show="showIndicatorPicker" position="bottom">
              <van-picker
                :columns="indicatorOptions"
                @confirm="handleIndicatorConfirm"
                @cancel="showIndicatorPicker = false"
              />
            </van-popup>

            <van-field
              v-model="regionText"
              is-link
              readonly
              label="研究区域"
              placeholder="选择行政区"
              @click="showRegionPicker = true"
            />
            <van-popup v-model:show="showRegionPicker" position="bottom">
              <van-cascader
                v-model="inversionForm.region"
                title="选择区域"
                :options="CHINA_REGIONS"
                :field-names="regionFieldNames"
                @close="showRegionPicker = false"
                @finish="handleRegionFinish"
              />
            </van-popup>

            <van-field
              v-model="dataSourceText"
              is-link
              readonly
              label="数据源"
              placeholder="请选择数据源"
              @click="showDataSourcePicker = true"
            />
            <van-popup v-model:show="showDataSourcePicker" position="bottom">
              <van-picker
                :columns="dataSourceOptions"
                @confirm="handleDataSourceConfirm"
                @cancel="showDataSourcePicker = false"
              />
            </van-popup>

            <van-field
              v-model="modelText"
              is-link
              readonly
              label="算法模型"
              placeholder="请选择模型"
              @click="showModelPicker = true"
            />
            <van-popup v-model:show="showModelPicker" position="bottom">
              <van-picker
                :columns="modelOptions"
                @confirm="handleModelConfirm"
                @cancel="showModelPicker = false"
              />
            </van-popup>
          </van-cell-group>

          <div class="form-actions">
            <van-button
              type="primary"
              size="large"
              block
              round
              :loading="isAnalyzing"
              native-type="submit"
            >
              {{ isAnalyzing ? 'AI 反演中...' : '开始反演' }}
            </van-button>
          </div>

          <div v-if="isAnalyzing" class="progress-section">
            <van-cell-group inset>
              <van-cell title="反演进度">
                <template #value>
                  <span class="neon-text">{{ progress }}%</span>
                </template>
              </van-cell>
              <van-cell>
                <van-progress :percentage="progress" :show-pivot="false" color="#00ffcc" />
              </van-cell>
            </van-cell-group>
          </div>
        </van-form>

        <div v-if="hasResult" class="result-section">
          <van-cell-group title="空间分布图" inset>
            <div ref="mapContainer" class="map-container" />
          </van-cell-group>

          <van-cell-group title="统计信息" inset>
            <van-cell title="平均值" :value="`${stats.mean} ${indicatorUnit}`" />
            <van-cell title="最大值" :value="`${stats.max} ${indicatorUnit}`" />
            <van-cell title="最小值" :value="`${stats.min} ${indicatorUnit}`" />
            <van-cell title="标准差" :value="`${stats.std} ${indicatorUnit}`" />
          </van-cell-group>

          <van-cell-group title="分布直方图" inset>
            <div ref="chartContainer" class="chart-container" />
          </van-cell-group>
        </div>

        <van-empty v-else description="请选择参数并开始反演分析" />
      </template>

      <template v-else>
        <van-cell-group inset>
          <van-cell title="当前指标" :value="selectedTsIndicatorText" is-link @click="showTsIndicatorPicker = true" />
          <van-cell>
            <template #title>
              <span>当前时间</span>
            </template>
            <template #value>
              <span class="neon-text">{{ currentDate }}</span>
            </template>
          </van-cell>
        </van-cell-group>

        <van-popup v-model:show="showTsIndicatorPicker" position="bottom">
          <van-picker
            :columns="tsIndicatorOptions"
            @confirm="handleTsIndicatorConfirm"
            @cancel="showTsIndicatorPicker = false"
          />
        </van-popup>

        <van-cell-group title="时间轴控制" inset>
          <van-cell>
            <div class="timeline-control">
              <van-slider
                v-model="timelineIndex"
                :max="timelineData.length - 1"
                :step="1"
                active-color="#00ffcc"
                @change="handleTimelineChange"
              />
              <div class="timeline-markers">
                <span
                  v-for="(item, index) in timelineData"
                  :key="index"
                  class="marker"
                  :class="{ active: index === timelineIndex }"
                >
                  {{ item.label }}
                </span>
              </div>
            </div>
          </van-cell>

          <van-cell>
            <div class="control-buttons">
              <van-button
                type="primary"
                size="small"
                :icon="isPlaying ? 'pause' : 'play'"
                @click="handlePlay"
              >
                {{ isPlaying ? '暂停' : '播放' }}
              </van-button>
              <van-button
                size="small"
                icon="replay"
                @click="handleReset"
              >
                重置
              </van-button>
            </div>
          </van-cell>
        </van-cell-group>

        <van-cell-group title="地图对比" inset>
          <van-tabs v-model:active="activeMapTab" swipeable :lazy-render="false">
            <van-tab title="当前时间">
              <div ref="mapContainer1" class="map-container" />
              <van-cell title="日期" :value="currentDate" />
            </van-tab>
            <van-tab title="对比时间">
              <div ref="mapContainer2" class="map-container" />
              <van-cell
                title="日期"
                :value="comparisonDate"
                is-link
                @click="showDatePicker = true"
              />
            </van-tab>
          </van-tabs>
        </van-cell-group>

        <van-popup v-model:show="showDatePicker" position="bottom">
          <van-picker
            :columns="dateOptions"
            @confirm="handleDateConfirm"
            @cancel="showDatePicker = false"
          />
        </van-popup>

        <van-cell-group title="变化趋势" inset>
          <div ref="tsChartContainer" class="chart-container" />
        </van-cell-group>

        <van-cell-group title="统计分析" inset>
          <van-cell title="平均值" :value="`${tsStats.mean} g/kg`" />
          <van-cell title="变化幅度" :value="`${tsStats.change > 0 ? '+' : ''}${tsStats.change}%`">
            <template #value>
              <span :class="tsStats.change > 0 ? 'increase' : 'decrease'">
                {{ tsStats.change > 0 ? '+' : '' }}{{ tsStats.change }}%
              </span>
            </template>
          </van-cell>
          <van-cell title="最大值" :value="`${tsStats.max} g/kg`" />
          <van-cell title="最小值" :value="`${tsStats.min} g/kg`" />
        </van-cell-group>
      </template>
    </div>

    <AppTabbar />
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import * as echarts from 'echarts'
import { createBaseMap, addRemoteSensingImage, CHINA_REGIONS } from '@/utils/map-utils'
import { useInversionData, useSoilIndicators, useTimelineData } from '@/composables/useDatabase'

const { dataList } = useInversionData()
const { indicators } = useSoilIndicators()
const { timeline } = useTimelineData()
const router = useRouter()
const route = useRoute()

type InversionMode = 'single' | 'timeseries'

const activeMode = ref<InversionMode>('single')
const showModeMenu = ref(false)
const modeActions = [
  { text: '单图反演', value: 'single' },
  { text: '时序分析', value: 'timeseries' },
]
const activeModeLabel = computed(() => activeMode.value === 'single' ? '单图反演' : '时序分析')

const applyModeFromQuery = (rawMode: unknown) => {
  const mode = rawMode === 'timeseries' ? 'timeseries' : 'single'
  activeMode.value = mode
}

const syncModeToQuery = (mode: InversionMode) => {
  const nextQuery = { ...route.query }
  if (mode === 'timeseries') {
    nextQuery.mode = 'timeseries'
  } else {
    delete nextQuery.mode
  }
  router.replace({ path: '/inversion', query: nextQuery })
}

const handleModeSelect = (action: { value: InversionMode }) => {
  activeMode.value = action.value
  showModeMenu.value = false
  syncModeToQuery(action.value)
}

const inversionForm = ref({
  indicator: '',
  region: '',
  dataSource: '',
  model: ''
})

const showIndicatorPicker = ref(false)
const showRegionPicker = ref(false)
const showDataSourcePicker = ref(false)
const showModelPicker = ref(false)

const indicatorOptions = computed(() => {
  const dbOptions = indicators.value.map((item) => ({
    text: `${item.label} (${item.code})`,
    value: item.code,
  }))

  return [
    ...dbOptions,
    { text: '土壤含水量', value: 'waterContent' },
    { text: '植被指数 (NDVI)', value: 'NDVI' },
  ]
})

const dataSourceOptions = computed(() => {
  if (!dataList.value.length) {
    return [{ text: '暂无可用数据源', value: '' }]
  }

  return dataList.value.map((item) => ({
    text: item.name,
    value: item.id,
  }))
})

const modelOptions = [
  { text: '随机森林', value: 'rf' },
  { text: '支持向量机', value: 'svm' },
  { text: '深度学习', value: 'dl' }
]

const regionFieldNames = {
  text: 'label',
  value: 'value',
  children: 'children',
}

const indicatorText = ref('')
const regionText = ref('')
const dataSourceText = ref('')
const modelText = ref('')

const isAnalyzing = ref(false)
const progress = ref(0)
const hasResult = ref(false)

const selectedIndicator = computed(() => {
  return indicators.value.find((item) => item.code === inversionForm.value.indicator) ?? null
})

const indicatorUnit = computed(() => selectedIndicator.value?.unit ?? 'g/kg')

const stats = computed(() => {
  if (!selectedIndicator.value) {
    return {
      mean: 12.45,
      max: 25.8,
      min: 3.2,
      std: 4.67,
    }
  }

  return {
    mean: selectedIndicator.value.mean,
    max: selectedIndicator.value.max,
    min: selectedIndicator.value.min,
    std: selectedIndicator.value.std,
  }
})

const distributionData = computed(() => {
  return selectedIndicator.value?.distribution ?? [120, 280, 450, 320, 180, 80]
})

const resultLayerUrl = computed(() => {
  const code = inversionForm.value.indicator
  if (code === 'TN') return '/demo_bundle/results/pred_TN_0-5cm_1km_mean_preview.png'
  if (code === 'TP') return '/demo_bundle/results/pred_TP_0-5cm_1km_mean_preview.png'
  return '/demo_bundle/results/pred_OC_0-5cm_1km_mean_preview.png'
})

const mapContainer = ref<HTMLElement>()
const chartContainer = ref<HTMLElement>()
let singleMap: any = null
let singleChart: echarts.ECharts | null = null
const handleSingleResize = () => singleChart?.resize()

const handleIndicatorConfirm = ({ selectedOptions }: any) => {
  inversionForm.value.indicator = selectedOptions[0].value
  indicatorText.value = selectedOptions[0].text
  showIndicatorPicker.value = false
}

const handleRegionFinish = ({ selectedOptions }: any) => {
  regionText.value = selectedOptions
    .map((option: any) => option.label ?? option.text)
    .join('/')
  showRegionPicker.value = false
}

const handleDataSourceConfirm = ({ selectedOptions }: any) => {
  inversionForm.value.dataSource = selectedOptions[0].value
  dataSourceText.value = selectedOptions[0].text
  showDataSourcePicker.value = false
}

const handleModelConfirm = ({ selectedOptions }: any) => {
  inversionForm.value.model = selectedOptions[0].value
  modelText.value = selectedOptions[0].text
  showModelPicker.value = false
}

const initMap = () => {
  if (!mapContainer.value) {
    return
  }

  if (singleMap) {
    singleMap.setTarget(null)
    singleMap = null
  }

  singleMap = createBaseMap(mapContainer.value, [110.3, 29.2], 11)
  addRemoteSensingImage(
    singleMap,
    resultLayerUrl.value,
    [110.02, 28.97, 110.62, 29.51],
  )
}

const initChart = () => {
  if (!chartContainer.value) {
    return
  }

  if (!singleChart) {
    singleChart = echarts.init(chartContainer.value)
    window.addEventListener('resize', handleSingleResize)
  }

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '10%',
      right: '5%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: ['0-5', '5-10', '10-15', '15-20', '20-25', '25+'],
      axisLine: { lineStyle: { color: '#4A4E54' } },
      axisLabel: { color: '#A0A4A8' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4A4E54' } },
      axisLabel: { color: '#A0A4A8' },
      splitLine: { lineStyle: { color: '#2D3135' } }
    },
    series: [
      {
        data: distributionData.value,
        type: 'bar',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00ffcc' },
            { offset: 1, color: '#00ffcc33' }
          ])
        },
        barWidth: '50%'
      }
    ]
  }

  singleChart.setOption(option, true)
}

const handleStartInversion = async () => {
  if (!inversionForm.value.indicator || !inversionForm.value.dataSource || !inversionForm.value.model) {
    showToast('请完整填写参数')
    return
  }

  isAnalyzing.value = true
  progress.value = 0
  hasResult.value = false

  const progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += 10
    }
  }, 500)

  setTimeout(() => {
    clearInterval(progressInterval)
    progress.value = 100
    isAnalyzing.value = false
    hasResult.value = true
    showToast({ type: 'success', message: '反演完成' })

    nextTick(() => {
      initMap()
      initChart()
    })
  }, 5000)
}

const showTsIndicatorPicker = ref(false)
const showDatePicker = ref(false)
const tsIndicatorOptions = [
  { text: '土壤有机质', value: 'organicMatter' },
  { text: '土壤含水量', value: 'waterContent' },
  { text: '盐渍化程度', value: 'salinization' },
]
const selectedTsIndicator = ref('organicMatter')
const selectedTsIndicatorText = ref('土壤有机质')

const fallbackTimelineData = [
  { label: '2024-03', value: '2024-03-15', date: '2024年3月' },
  { label: '2024-06', value: '2024-06-15', date: '2024年6月' },
  { label: '2024-09', value: '2024-09-15', date: '2024年9月' },
  { label: '2024-12', value: '2024-12-15', date: '2024年12月' },
  { label: '2025-03', value: '2025-03-15', date: '2025年3月' },
]

const timelineData = computed(() => {
  if (!timeline.value.length) {
    return fallbackTimelineData
  }

  return timeline.value.map((item) => ({
    label: item.date.slice(0, 7),
    value: item.date,
    date: item.date,
  }))
})

const timelineIndex = ref(0)
const currentDate = computed(() => timelineData.value[timelineIndex.value]?.date || '-')
const comparisonDate = ref('2024年3月')
const dateOptions = computed(() => timelineData.value.map((item) => ({ text: item.date, value: item.date })))

const isPlaying = ref(false)
let playInterval: number | null = null
const activeMapTab = ref(0)

const tsStats = ref({
  mean: 12.45,
  change: 8.5,
  max: 25.8,
  min: 3.2,
})

const tsIndicatorSeriesMap: Record<string, number[]> = {
  organicMatter: [10.2, 11.5, 12.1, 13.2, 12.8],
  waterContent: [28.5, 29.2, 30.1, 31.5, 30.9],
  salinization: [3.4, 3.1, 2.8, 2.6, 2.4],
}

const mapContainer1 = ref<HTMLElement>()
const mapContainer2 = ref<HTMLElement>()
const tsChartContainer = ref<HTMLElement>()
let tsMap1: any = null
let tsMap2: any = null
let tsChart: echarts.ECharts | null = null
const handleTsResize = () => tsChart?.resize()

const handleTsIndicatorConfirm = ({ selectedOptions }: any) => {
  selectedTsIndicator.value = selectedOptions[0].value
  selectedTsIndicatorText.value = selectedOptions[0].text
  showTsIndicatorPicker.value = false
}

const handleDateConfirm = ({ selectedOptions }: any) => {
  comparisonDate.value = selectedOptions[0].value
  showDatePicker.value = false
}

const handleTimelineChange = () => {
  updateTimeSeriesMaps()
}

const stopTimelinePlay = () => {
  if (playInterval !== null) {
    clearInterval(playInterval)
    playInterval = null
  }
  isPlaying.value = false
}

const handlePlay = () => {
  if (isPlaying.value) {
    stopTimelinePlay()
    return
  }

  isPlaying.value = true
  playInterval = window.setInterval(() => {
    if (timelineIndex.value < timelineData.value.length - 1) {
      timelineIndex.value += 1
    } else {
      timelineIndex.value = 0
    }
    updateTimeSeriesMaps()
  }, 2000)
}

const handleReset = () => {
  stopTimelinePlay()
  timelineIndex.value = 0
  updateTimeSeriesMaps()
}

const updateTimeSeriesMaps = () => {
  if (tsMap1) {
    tsMap1.updateSize?.()
  }
  if (tsMap2) {
    tsMap2.updateSize?.()
  }
}

const initTimeSeriesMaps = () => {
  if (mapContainer1.value) {
    if (!tsMap1) {
      tsMap1 = createBaseMap(mapContainer1.value, [110.3, 29.2], 11)
      addRemoteSensingImage(
        tsMap1,
        '/demo_bundle/processed/ndvi_preview.png',
        [110.02, 28.97, 110.62, 29.51],
      )
    } else {
      tsMap1.setTarget(mapContainer1.value)
    }
  }

  if (mapContainer2.value) {
    if (!tsMap2) {
      tsMap2 = createBaseMap(mapContainer2.value, [110.3, 29.2], 11)
      addRemoteSensingImage(
        tsMap2,
        '/demo_bundle/processed/ndvi_preview.png',
        [110.02, 28.97, 110.62, 29.51],
      )
    } else {
      tsMap2.setTarget(mapContainer2.value)
    }
  }

  updateTimeSeriesMaps()
  window.setTimeout(() => updateTimeSeriesMaps(), 80)
}

const destroyTimeSeriesViews = () => {
  stopTimelinePlay()

  tsChart?.dispose()
  tsChart = null

  if (tsMap1) {
    tsMap1.setTarget(null)
    tsMap1 = null
  }
  if (tsMap2) {
    tsMap2.setTarget(null)
    tsMap2 = null
  }
}

const initTimeSeriesChart = () => {
  if (!tsChartContainer.value) {
    return
  }

  if (!tsChart) {
    tsChart = echarts.init(tsChartContainer.value)
    window.addEventListener('resize', handleTsResize)
  }

  const seriesData = tsIndicatorSeriesMap[selectedTsIndicator.value] || tsIndicatorSeriesMap.organicMatter
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '10%',
      right: '5%',
      top: '10%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: timelineData.value.map((item) => item.label),
      axisLine: { lineStyle: { color: '#4A4E54' } },
      axisLabel: { color: '#A0A4A8' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4A4E54' } },
      axisLabel: { color: '#A0A4A8', formatter: '{value} g/kg' },
      splitLine: { lineStyle: { color: '#2D3135' } },
    },
    series: [
      {
        data: seriesData,
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#00ffcc',
          width: 2,
        },
        itemStyle: {
          color: '#00ffcc',
          borderWidth: 2,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00ffcc66' },
            { offset: 1, color: '#00ffcc00' },
          ]),
        },
      },
    ],
  }

  tsChart.setOption(option, true)
}

watch(activeMode, (mode) => {
  if (mode === 'timeseries') {
    nextTick(() => {
      initTimeSeriesMaps()
      initTimeSeriesChart()
    })
  } else {
    destroyTimeSeriesViews()
  }
})

watch(selectedTsIndicator, () => {
  if (activeMode.value === 'timeseries') {
    nextTick(() => initTimeSeriesChart())
  }
})

watch(activeMapTab, () => {
  if (activeMode.value === 'timeseries') {
    nextTick(() => {
      initTimeSeriesMaps()
      updateTimeSeriesMaps()
    })
  }
})

watch(() => route.query.mode, (mode) => {
  applyModeFromQuery(mode)
})

onMounted(() => {
  applyModeFromQuery(route.query.mode)
})

onUnmounted(() => {
  destroyTimeSeriesViews()

  window.removeEventListener('resize', handleSingleResize)
  window.removeEventListener('resize', handleTsResize)

  singleChart?.dispose()

  if (singleMap) {
    singleMap.setTarget(null)
    singleMap = null
  }
  if (tsMap1) {
    tsMap1.setTarget(null)
    tsMap1 = null
  }
  if (tsMap2) {
    tsMap2.setTarget(null)
    tsMap2 = null
  }
})
</script>

<style scoped lang="scss">
.inversion-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-primary;

  .page-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0 calc(96px + env(safe-area-inset-bottom));
  }

  .mode-switch-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-color: rgba(0, 255, 204, 0.45);
    color: #00ffcc;
  }

  .form-actions {
    padding: 16px;
  }

  .progress-section {
    margin-top: 16px;
  }

  .result-section {
    margin-top: 16px;
  }

  .map-container {
    width: 100%;
    height: 300px;
    background: $bg-secondary;
    border-radius: 8px;
  }

  .chart-container {
    width: 100%;
    height: 250px;
    padding: 12px 0;
  }

  .timeline-control {
    width: 100%;
    padding: 12px 0;

    .timeline-markers {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;

      .marker {
        font-size: 12px;
        color: #a0a4a8;

        &.active {
          color: $primary-color;
          font-weight: 700;
        }
      }
    }
  }

  .control-buttons {
    display: flex;
    gap: 12px;
  }

  .increase {
    color: #ff3b30;
  }

  .decrease {
    color: #34c759;
  }
}
</style>
