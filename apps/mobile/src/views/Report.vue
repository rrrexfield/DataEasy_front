<template>
  <div class="report-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="成果报告"
      fixed
      placeholder
    >
      <template #right>
        <van-button
          size="small"
          type="primary"
          icon="plus"
          class="generate-btn"
          @click="handleGenerate"
        >
          生成
        </van-button>
      </template>
    </van-nav-bar>

    <div class="page-content">
      <!-- 报告列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell
            v-for="report in reportList"
            :key="report.id"
            class="report-list-item"
            :title="report.displayName"
            is-link
            @click="handleSelectReport(report)"
          >
            <template #label>
              <div class="cell-label-wrap">
                <div class="study-area">{{ report.createTime }}</div>
                <div class="meta-row">
                  <van-tag
                    type="primary"
                    class="data-meta-tag"
                  >
                    {{ report.analysisTag }}
                  </van-tag>
                  <van-tag
                    type="primary"
                    class="data-meta-tag"
                  >
                    {{ report.qualityTag }}
                  </van-tag>
                  <van-tag
                    v-if="report.sourceTag"
                    type="primary"
                    class="data-meta-tag"
                  >
                    {{ report.sourceTag }}
                  </van-tag>
                </div>
              </div>
            </template>
            <template #icon>
              <van-icon name="description" size="20" color="#00ffcc" />
            </template>
            <template #right-icon>
              <van-icon name="arrow" />
            </template>
          </van-cell>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 报告预览弹窗 -->
    <van-popup
      v-model:show="showPreview"
      position="bottom"
      :style="{ height: '90%' }"
      round
    >
      <div class="preview-container">
        <div class="preview-header">
          <h3>{{ currentReport?.displayName || currentReport?.name }}</h3>
          <van-space>
            <van-button
              size="small"
              icon="cross"
              @click="showPreview = false"
            >
            </van-button>
            <van-button size="small" type="primary" @click="showExportSheet = true">
              导出
            </van-button>
          </van-space>
        </div>

        <div class="preview-content">
          <div v-if="currentReport" class="report-preview">
            <!-- 报告封面 -->
            <div class="report-section cover">
              <h1>{{ currentReport.name }}</h1>
              <p class="subtitle">土壤质量智能监测平台</p>
              <p class="date">生成日期: {{ currentReport.createTime }}</p>
              <p class="study-area">研究区域: {{ currentReport.studyArea }}</p>
            </div>

            <!-- 概述 -->
            <div class="report-section">
              <h2>一、概述</h2>
              <p>
                本报告基于高光谱遥感数据，利用AI智能分析技术，对研究区域的土壤质量进行综合评估。
                <span v-if="currentReport.analysisType === 'single'">
                  本次分析针对{{ currentReport.startDate }}的单期影像数据。
                </span>
                <span v-else>
                  监测时间范围为{{ currentReport.startDate }}至{{ currentReport.endDate }}。
                </span>
                主要监测指标包括土壤有机质、含水量等。
              </p>
            </div>

            <!-- 综合指数 -->
            <div class="report-section">
              <h2>二、土壤质量综合指数</h2>
              <div class="index-display">
                <div class="index-value neon-text">{{ currentReport.qualityScore || 72 }}</div>
                <div class="index-label">综合指数</div>
              </div>
            </div>

            <!-- AI分析结论 -->
            <div class="report-section">
              <h2>三、AI分析结论</h2>
              <p>{{ currentReport.summary || 'AI综合分析显示该区域土壤质量良好，有机质含量适中，水分条件适宜。' }}</p>
            </div>

            <!-- 空间分布 -->
            <div class="report-section">
              <h2>四、空间分布</h2>
              <div class="map-image">
                <img src="/demo_bundle/results/pred_OC_0-5cm_1km_mean_preview.png" alt="空间分布图" />
              </div>
            </div>

            <!-- 指标详情 -->
            <div class="report-section">
              <h2>五、指标详情</h2>
              <van-cell-group>
                <van-cell
                  title="土壤有机质"
                  :value="formatIndicatorValue(currentReport.indicators?.organicMatter, 'g/kg')"
                />
                <van-cell
                  title="土壤含水量"
                  :value="formatIndicatorValue(currentReport.indicators?.moisture, '%')"
                />
                <van-cell
                  title="土壤盐分"
                  :value="formatIndicatorValue(currentReport.indicators?.salinity, 'g/kg')"
                />
              </van-cell-group>
            </div>

            <!-- 风险区域 -->
            <div class="report-section">
              <h2>六、风险区域识别</h2>
              <p>共识别出 {{ riskZoneCount }} 个风险区域，需要重点关注。</p>
            </div>

            <!-- 建议 -->
            <div class="report-section">
              <h2>七、管理建议</h2>
              <p>{{ recommendationText(currentReport.recommendations) }}</p>
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 导出选项 -->
    <van-action-sheet
      v-model:show="showExportSheet"
      :actions="exportActions"
      cancel-text="取消"
      close-on-click-action
      @select="handleExport"
    />

    <van-action-sheet
      v-model:show="showGenerateSheet"
      :actions="generateActions"
      cancel-text="取消"
      close-on-click-action
      @select="handleGenerateSelect"
    />

    <van-action-sheet
      v-model:show="showDataSourceSheet"
      :actions="singleDataActions"
      cancel-text="取消"
      close-on-click-action
      @select="handleSingleDataSelect"
    />

    <AppTabbar />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { showToast } from 'vant'
import { useReports, useRiskZones, useSoilIndex } from '@/composables/useDatabase'
import { useInversionData } from '@/composables/useDatabase'

const { reports, refresh, create } = useReports()
const { zones } = useRiskZones()
const { soilIndex } = useSoilIndex()
const { dataList } = useInversionData()

const ZJJ_DATA_NAME = 'DZ01V_L2_E110.3_N29.2_20251225031144_01_T1_MTL'

const ZJJ_RECOMMENDATIONS = [
  '盐渍化区域应优先实施排水改造，降低地下水位并进行季节性淋洗。',
  '持续增施有机肥并推进秸秆还田，提升低值区域土壤有机质。',
  '建立分区墒情监测，雨季重排水、旱季重补灌。',
  '按分区优化作物布局，盐渍化区域优先耐盐作物。',
  '建立“天-空-地”一体化长期监测机制，按季度输出评估报告。',
  '推广精准农业和测土配方施肥，逐步降低化肥投入并提升土壤质量。',
]

const ZJJ_DATA_SOURCE = {
  id: 'e4a7b9c2f6d1',
  name: ZJJ_DATA_NAME,
  date: '2025-12-25',
  productId: 'DZ01V_L2_E110.3_N29.2_20251225031144_01_T1',
  spacecraft: 'DZ01',
  sensor: 'VNIR',
  bounds: {
    north: 29.509381,
    south: 28.971594,
    east: 110.617518,
    west: 110.024867,
  },
}

const normalizeReport = (report: any) => {
  const isZjj = String(report.studyArea || '').includes('张家界') || String(report.name || '').includes('DZ01V')

  if (!isZjj || report.analysisType !== 'single') {
    return report
  }

  return {
    ...report,
    name: report.dataSource?.name || ZJJ_DATA_NAME,
    createTime: report.createTime || '2025-12-25 03:11:44',
    startDate: report.startDate || '2025-12-25',
    endDate: report.endDate || '2025-12-25',
    qualityScore: 76,
    qualityLevel: '良好',
    summary: '基于DZ01卫星2025-12-25高光谱影像评估，张家界监测区综合指数76分（良好）。有机质平均47.3 g/kg、含水量平均35.2%，整体肥力较好；西北部河谷平原存在轻度盐渍化（约12%，约3.2平方公里），建议优先实施分区治理。',
    recommendations: ZJJ_RECOMMENDATIONS,
    dataSource: report.dataSource || ZJJ_DATA_SOURCE,
    indicators: {
      organicMatter: {
        avg: 47.3,
        min: 32.1,
        max: 65.8,
        std: 8.2,
        trend: 'stable',
        status: 'good',
        description: '整体处于较高水平，东南山地森林区最高，西北河谷地带相对较低。',
      },
      moisture: {
        avg: 35.2,
        min: 18.5,
        max: 52.7,
        std: 7.8,
        trend: 'stable',
        status: 'good',
        description: '整体处于适宜水平，受地形和植被覆盖影响显著。',
      },
      salinity: {
        avg: 3.2,
        level: 'light',
        area: '西北部河谷平原区域',
        coverage: '约12%（约3.2平方公里）',
        status: 'warning',
        description: '存在轻度盐渍化，建议优先实施排水改造与土壤改良。',
      },
    },
  }
}

const reportList = computed(() => reports.value.map((report) => {
  const normalized = normalizeReport(report)
  const sourceName = normalized.dataSource?.name || ''

  return {
    ...normalized,
    displayName: normalized.analysisType === 'single'
      ? (sourceName || normalized.name)
      : normalized.name,
    analysisTag: normalized.analysisType === 'single' ? '单图分析' : '时序分析',
    qualityTag: `质量:${normalized.qualityLevel || '--'}`,
    sourceTag: sourceName ? `数据:${sourceName.slice(0, 14)}...` : '',
  }
}))
const riskZoneCount = computed(() => zones.value.length || 3)

// 列表加载状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 预览状态
const showPreview = ref(false)
const currentReport = ref<any>(null)

// 导出选项
const showExportSheet = ref(false)
const exportActions = [
  { name: '导出为PDF', value: 'pdf' },
  { name: '导出为Word', value: 'word' },
  { name: '导出为图片', value: 'image' },
  { name: '分享链接', value: 'link' }
]
const showGenerateSheet = ref(false)
const generateActions = [
  { name: '单图分析', value: 'single' },
  { name: '时序分析', value: 'timeseries' },
]
const showDataSourceSheet = ref(false)

const singleDataActions = computed(() => {
  return dataList.value.map((item) => ({
    name: `${item.name} (${item.date})`,
    value: item.id,
  }))
})

// 列表加载
const onLoad = () => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 500)
}

// 下拉刷新
const onRefresh = () => {
  refresh()
  refreshing.value = false
  showToast({ type: 'success', message: '刷新成功' })
}

// 选择报告
const handleSelectReport = (report: any) => {
  currentReport.value = normalizeReport(report)
  showPreview.value = true
}

// 生成报告
const handleGenerate = () => {
  showGenerateSheet.value = true
}

const handleGenerateSelect = (action: { value: 'single' | 'timeseries'; name: string }) => {
  if (action.value === 'single') {
    if (!singleDataActions.value.length) {
      showToast({ type: 'fail', message: '暂无可用反演数据，请先完成反演' })
      return
    }

    showDataSourceSheet.value = true
    return
  }

  createReportByType('timeseries')
}

const handleSingleDataSelect = (action: { value: string }) => {
  createReportByType('single', action.value)
}

const createReportByType = (analysisType: 'single' | 'timeseries', dataId?: string) => {
  const now = dayjs()
  const selectedData = analysisType === 'single'
    ? dataList.value.find((item) => item.id === dataId) ?? null
    : null

  if (analysisType === 'single' && !selectedData) {
    showToast({ type: 'fail', message: '暂无可用反演数据，请先完成反演' })
    return
  }

  const id = `report-${now.valueOf()}`
  const qualityScore = Math.round(soilIndex.value?.value ?? 72)
  const qualityLevel = qualityScore >= 80 ? '优' : qualityScore >= 60 ? '中等' : '较低'
  const defaultArea = selectedData?.studyArea || dataList.value[0]?.studyArea || '研究区'
  const startDate = analysisType === 'single'
    ? dayjs(selectedData?.date || now).format('YYYY-MM-DD')
    : now.subtract(90, 'day').format('YYYY-MM-DD')
  const endDate = now.format('YYYY-MM-DD')

  const isZjj = String(selectedData?.studyArea || defaultArea).includes('张家界')
  const reportPayload: any = {
    id,
    name: analysisType === 'single'
      ? (selectedData?.name || '单图分析报告')
      : `${defaultArea}时序分析报告`,
    createTime: now.format('YYYY-MM-DD HH:mm:ss'),
    startDate,
    endDate,
    studyArea: selectedData?.studyArea || defaultArea,
    analysisType,
    qualityScore,
    qualityLevel: isZjj && analysisType === 'single' ? '良好' : qualityLevel,
    summary: analysisType === 'single'
      ? `单图分析结果显示：研究区域土壤综合指数为 ${qualityScore}，建议结合采样点进行空间复核。`
      : `时序分析结果显示：研究区域土壤综合指数为 ${qualityScore}，建议持续监测季度变化趋势。`,
    recommendations: [
      '建议持续开展季节性监测并维护样点一致性。',
      '重点关注中高风险区域，进行定点采样复核。',
    ],
    indicators: {
      organicMatter: { avg: 12.45 },
      moisture: { avg: 23.8 },
      salinity: { avg: 0.65 },
    },
    dataSource: analysisType === 'single' ? {
      id: selectedData?.id,
      name: selectedData?.name,
      date: selectedData?.date,
    } : undefined,
  }

  if (isZjj && analysisType === 'single') {
    reportPayload.summary = '基于DZ01卫星2025-12-25高光谱影像评估，张家界监测区综合指数76分（良好）。有机质平均47.3 g/kg、含水量平均35.2%，整体肥力较好；西北部河谷平原存在轻度盐渍化（约12%，约3.2平方公里），建议优先实施分区治理。'
    reportPayload.recommendations = ZJJ_RECOMMENDATIONS
    reportPayload.qualityScore = 76
    reportPayload.qualityLevel = '良好'
    reportPayload.dataSource = ZJJ_DATA_SOURCE
    reportPayload.indicators = {
      organicMatter: { avg: 47.3, min: 32.1, max: 65.8, std: 8.2, trend: 'stable' },
      moisture: { avg: 35.2, min: 18.5, max: 52.7, std: 7.8, trend: 'stable' },
      salinity: { avg: 3.2, level: 'light', area: '西北部河谷平原区域', coverage: '约12%（约3.2平方公里）' },
    }
  }

  create(reportPayload)
  refresh()
  showToast({
    type: 'success',
    message: `${analysisType === 'single' ? '单图分析' : '时序分析'}报告生成成功`,
  })
}

const formatIndicatorValue = (item: { avg?: number } | undefined, unit: string) => {
  const value = item?.avg
  if (typeof value !== 'number') {
    return `-- ${unit}`
  }

  return `${value.toFixed(2)} ${unit}`
}

const recommendationText = (recommendations: string[] | undefined) => {
  if (!recommendations?.length) {
    return '建议加强土壤监测，定期补充有机质，保持适宜的土壤水分。'
  }

  return recommendations.join('；')
}

const buildReportMarkdown = (report: any) => {
  return [
    `# ${report.name}`,
    '',
    `- 生成日期: ${report.createTime}`,
    `- 研究区域: ${report.studyArea}`,
    `- 综合指数: ${report.qualityScore}`,
    '',
    '## 分析结论',
    report.summary || '',
    '',
    '## 管理建议',
    ...(report.recommendations || []).map((item: string, index: number) => `${index + 1}. ${item}`),
  ].join('\n')
}

const downloadReport = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// 导出报告
const handleExport = async (action: any) => {
  if (!currentReport.value) {
    showToast('请先选择报告')
    return
  }

  const now = dayjs().format('YYYYMMDD_HHmmss')
  const markdown = buildReportMarkdown(currentReport.value)

  if (action.value === 'link') {
    const shareLink = `${window.location.origin}/report?id=${currentReport.value.id}`
    try {
      await navigator.clipboard.writeText(shareLink)
      showToast({ type: 'success', message: '链接已复制' })
    } catch {
      showToast({ type: 'fail', message: '复制失败，请手动分享' })
    }
    return
  }

  if (action.value === 'word') {
    downloadReport(`soil_report_${now}.doc`, markdown, 'application/msword')
  } else if (action.value === 'image') {
    downloadReport(`soil_report_${now}.txt`, markdown, 'text/plain;charset=utf-8')
  } else {
    downloadReport(`soil_report_${now}.md`, markdown, 'text/markdown;charset=utf-8')
  }

  showToast({ type: 'success', message: `${action.name}成功` })
}
</script>

<style scoped lang="scss">
.report-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-primary;

  .page-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: calc(96px + env(safe-area-inset-bottom));
  }
}

.generate-btn {
  --van-button-primary-color: #00ffcc;

  :deep(.van-icon),
  :deep(.van-icon-plus) {
    color: #00ffcc !important;
  }

  :deep(.van-button__text) {
    color: #00ffcc !important;
  }
}

.cell-label-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-top: 2px;
}

.study-area {
  color: #aab0b7;
  font-size: 12px;
  line-height: 1.4;
}

.report-list-item {
  :deep(.van-cell__title) {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
    word-break: break-word;
    line-height: 1.4;
  }
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.data-meta-tag {
  border-radius: 6px;
  padding: 2px 10px;
  line-height: 1.3;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $bg-primary;

  .preview-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    border-bottom: 1px solid $border-color;

    h3 {
      margin: 0;
      font-size: 16px;
      color: $text-primary;
      line-height: 1.35;
      white-space: normal;
      word-break: break-word;
      flex: 1;
    }
  }

  .preview-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
}

.report-preview {
  max-width: 600px;
  margin: 0 auto;
  background: $bg-secondary;
  border-radius: 8px;
  padding: 20px;

  .report-section {
    margin-bottom: 24px;

    &.cover {
      text-align: center;
      padding: 40px 0;
      border-bottom: 2px solid $border-color;

      h1 {
        font-size: 24px;
        color: $primary-color;
        margin-bottom: 16px;
      }

      .subtitle {
        font-size: 16px;
        color: $text-secondary;
        margin-bottom: 24px;
      }

      .date,
      .study-area {
        font-size: 14px;
        color: $text-secondary;
        margin: 8px 0;
      }
    }

    h2 {
      font-size: 18px;
      color: $primary-color;
      margin-bottom: 12px;
      border-left: 4px solid $primary-color;
      padding-left: 12px;
    }

    p {
      font-size: 14px;
      line-height: 1.8;
      color: $text-secondary;
    }
  }

  .index-display {
    text-align: center;
    padding: 24px;
    background: linear-gradient(135deg, #25282B, #1C1F22);
    border-radius: 8px;
    border: 1px solid $border-color;

    .index-value {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .index-label {
      font-size: 14px;
      color: $text-secondary;
    }
  }

  .map-image {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    background: $bg-dark;

    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }
}
</style>
