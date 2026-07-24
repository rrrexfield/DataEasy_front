<template>
  <div class="report-page">
    <el-row :gutter="20" style="height: 100%">
      <!-- 左侧报告目录 -->
      <el-col :span="6">
        <el-card shadow="never" class="catalog-card">
          <template #header>
            <div class="card-header">
              <span>报告目录</span>
              <el-button type="primary" size="small" :icon="Plus" @click="handleGenerate">
                生成报告
              </el-button>
            </div>
          </template>

          <el-menu :default-active="activeReport" class="report-menu" @select="handleSelectReport">
            <el-menu-item v-for="report in reportList" :key="report.id" :index="report.id">
              <el-icon><Document /></el-icon>
              <span>{{ report.name }}</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 中央预览区 -->
      <el-col :span="14">
        <el-card shadow="never" class="preview-card">
          <template #header>
            <div class="card-header">
              <span>DOCX 报告预览</span>
            </div>
          </template>

          <!-- DOCX 预览 -->
          <div v-if="currentReport" class="docx-preview-wrapper">
            <div v-if="previewLoading" class="docx-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>正在生成 DOCX 预览...</span>
            </div>
            <div v-if="previewError" class="docx-error">
              <el-alert :title="previewError" type="error" show-icon :closable="false" />
            </div>
            <div ref="docxPreviewContainer" class="docx-preview-container" :class="{ 'is-ready': !previewLoading && !previewError }" />
          </div>

          <el-empty v-else description="请选择或生成报告" />
        </el-card>
      </el-col>

      <!-- 右侧导出选项 -->
      <el-col :span="4">
        <el-card shadow="never" class="export-card">
          <template #header>
            <span>导出选项</span>
          </template>

          <el-form v-if="currentReport" label-position="top">
            <el-form-item label="导出格式">
              <el-radio-group v-model="exportFormat">
                <el-radio label="docx">DOCX（Word）</el-radio>
                <el-radio label="pdf">PDF</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="包含内容">
              <el-checkbox-group v-model="exportContent">
                <el-checkbox label="indicators">指标分析</el-checkbox>
                <el-checkbox label="evidence">证据链</el-checkbox>
                <el-checkbox label="maps">地图截图</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-button
              type="primary"
              style="width: 100%"
              :icon="Download"
              :loading="exportLoading"
              :disabled="!currentReport"
              @click="handleExport"
            >
              {{ exportLoading ? '正在生成...' : '导出报告' }}
            </el-button>
          </el-form>
          <el-empty v-else description="请先选择报告" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 生成报告对话框 -->
    <el-dialog v-model="dialogVisible" title="生成报告" width="500px" :close-on-click-modal="false">
      <el-form label-width="120px">
        <el-form-item label="分析类型">
          <el-select v-model="analysisType" placeholder="请选择分析类型" style="width: 100%">
            <el-option label="单图分析" value="single" />
            <el-option label="时序分析" value="timeseries" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="showDataSelect" label="选择反演数据">
          <el-select v-model="selectedDataId" placeholder="请选择已反演数据" style="width: 100%">
            <el-option
              v-for="item in inversionDataList"
              :key="item.id"
              :label="`${item.name} (${item.date})`"
              :value="item.id"
            >
              <div class="data-option">
                <div class="data-name">{{ item.studyArea }} - {{ item.date }}</div>
                <div class="data-id">{{ item.id }}</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmGenerate">生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Plus, Document, Download, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useInversionData, useReports } from '@/composables/useDatabase'
import { parseReportTemplate } from '@/utils/report-parser'
import { downloadDocx, loadImageBuffers, type ReportData } from '@/utils/docx-builder'
import { useDocxPreview } from '@/composables/useDocxPreview'
import { evidenceAPI } from '@/db/api'

const activeReport = ref('report-zjj-2025')
const exportFormat = ref('docx')
const exportContent = ref(['indicators', 'evidence', 'maps'])
const exportLoading = ref(false)

// DOCX 预览
const docxPreviewContainer = ref<HTMLElement>()
const { previewLoading, previewError, previewReport } = useDocxPreview()

// 生成报告对话框状态
const dialogVisible = ref(false)
const analysisType = ref<'single' | 'timeseries'>('single')
const selectedDataId = ref('')

// 使用数据库 Composables
const { dataList: inversionDataList } = useInversionData()
const { reports: reportList, getById, create: createReport } = useReports()

// 调试：监听 reportList 变化
watch(() => reportList.value, (newVal) => {
  console.log('📋 报告列表更新:', newVal)
  console.log('📋 报告数量:', newVal.length)
}, { immediate: true })

// 调试：监听 activeReport 变化
watch(() => activeReport.value, (newVal) => {
  console.log('🎯 当前选中报告ID:', newVal)
  const report = getById(newVal)
  console.log('📄 加载的报告对象:', report)
}, { immediate: true })

// 是否显示数据选择
const showDataSelect = computed(() => analysisType.value === 'single')

// 旧的硬编码数据已被数据库数据替换
/*
const reportList = ref<ReportData[]>([
  {
    id: 'report-001',
    name: '2024年Q1土壤质量分析报告',
    createTime: '2024-03-20',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    studyArea: '研究区A',
    analysisType: 'timeseries',
    qualityScore: 72,
    qualityLevel: '中等',
    summary: '该区域整体土壤质量处于中等偏好水平',
    recommendations: [
      '加强西北部区域的排水改良工作',
      '适当增施有机肥，提高土壤肥力',
      '建立长期监测机制，跟踪土壤质量变化趋势',
    ],
    indicators: {
      organicMatter: { 
        avg: 45.8, 
        min: 35.2,
        max: 58.6,
        std: 6.5,
        trend: 'up', 
        status: 'good',
        description: '整体呈上升趋势，说明土壤肥力状况良好',
      },
      moisture: { 
        avg: 32.5,
        min: 22.1,
        max: 45.8,
        std: 7.2,
        trend: 'stable', 
        status: 'normal',
        description: '处于适中水平，有利于作物生长',
      },
      salinity: { 
        level: 'light', 
        area: '西北部',
        coverage: '约15%',
        status: 'warning',
        description: '建议加强监测和改良',
      },
    },
  },
  {
    id: 'report-002',
    name: '2023年度土壤质量年报',
    createTime: '2024-01-10',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    studyArea: '研究区B',
    analysisType: 'timeseries',
    qualityScore: 68,
    qualityLevel: '中等',
    summary: '整体土壤质量保持稳定',
    recommendations: [
      '持续监测土壤质量变化',
    ],
    indicators: {
      organicMatter: { 
        avg: 42.3, 
        min: 32.5,
        max: 53.2,
        std: 5.8,
        trend: 'stable', 
        status: 'normal',
        description: '保持稳定水平',
      },
      moisture: { 
        avg: 28.7,
        min: 18.3,
        max: 38.9,
        std: 6.1,
        trend: 'down', 
        status: 'normal',
        description: '略有下降，需要关注',
      },
      salinity: { 
        level: 'none', 
        area: '无',
        coverage: '0%',
        status: 'good',
        description: '未检测到盐渍化',
      },
    },
  },
])
*/

// 当前显示的报告
const currentReport = computed(() => {
  if (!activeReport.value) return null
  return getById(activeReport.value)
})

const handleSelectReport = (id: string) => {
  activeReport.value = id
}

const handleGenerate = () => {
  // 打开生成报告对话框
  dialogVisible.value = true
  analysisType.value = 'single'
  selectedDataId.value = ''
}

// 生成报告ID
const generateReportId = () => {
  return 'report-' + Date.now()
}

// 确认生成报告
const handleConfirmGenerate = async () => {
  if (analysisType.value === 'single' && !selectedDataId.value) {
    ElMessage.warning('请选择反演数据')
    return
  }

  // 查找选中的数据
  const selectedData = inversionDataList.value.find(d => d.id === selectedDataId.value)
  
  if (!selectedData && analysisType.value === 'single') {
    ElMessage.error('未找到所选数据')
    return
  }

  // 生成新报告（包含临时的证据链数据）
  const { report: newReport, evidenceData } = await generateReport(analysisType.value, selectedData)
  
  // 添加报告到数据库
  createReport(newReport)
  
  // 如果有证据链数据，保存到证据链表
  if (evidenceData && evidenceData.length > 0) {
    evidenceAPI.createEvidenceData(newReport.id, evidenceData)
  }
  
  // 选中新报告
  activeReport.value = newReport.id
  
  // 关闭对话框
  dialogVisible.value = false
  
  ElMessage.success('报告生成成功！')
}

// 生成报告内容
const generateReport = async (type: 'single' | 'timeseries', data?: any): Promise<{
  report: ReportData
  evidenceData?: Array<{
    regionId: number
    target: string
    pixelCount: number
    predMean: number
    predP50: number
    predP95: number
    topEvidence: Array<{
      factorId: number
      factorLabel: string
      baselineType: string
      freq: number
      deltaMean: number
      direction: string
      score: number
    }>
  }>
}> => {
  const reportId = generateReportId()
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]

  if (type === 'single' && data) {
    const productId = 'DZ01V_L2_E110.3_N29.2_20251225031144'
    const template = await parseReportTemplate(productId)

    const evidenceData = [
      {
        regionId: 0, target: 'OC_0-5cm_1km_mean', pixelCount: 2382, predMean: 1.847, predP50: 1.851, predP95: 1.978,
        topEvidence: [
          { factorId: 43, factorLabel: 'terrain_relief', baselineType: 'region_mean', freq: 0.726, deltaMean: 0.465, direction: 'increase', score: 0.338 },
          { factorId: 40, factorLabel: 'climate_bio15', baselineType: 'region_mean', freq: 0.183, deltaMean: -0.402, direction: 'decrease', score: 0.073 },
          { factorId: 19, factorLabel: 'ndre', baselineType: 'region_mean', freq: 0.064, deltaMean: -0.419, direction: 'decrease', score: 0.027 },
        ],
      },
      {
        regionId: 1, target: 'OC_0-5cm_1km_mean', pixelCount: 1144, predMean: 1.754, predP50: 1.756, predP95: 1.853,
        topEvidence: [
          { factorId: 43, factorLabel: 'terrain_relief', baselineType: 'region_mean', freq: 0.743, deltaMean: 0.420, direction: 'increase', score: 0.312 },
          { factorId: 40, factorLabel: 'climate_bio15', baselineType: 'region_mean', freq: 0.230, deltaMean: -0.375, direction: 'decrease', score: 0.086 },
          { factorId: 37, factorLabel: 'climate_bio1', baselineType: 'region_mean', freq: 0.027, deltaMean: 0.392, direction: 'increase', score: 0.011 },
        ],
      },
    ]

    // 构建丰富的基础报告数据
    const baseReport: ReportData = {
      id: reportId,
      name: `${data.studyArea}土壤质量综合分析报告`,
      createTime: dateStr,
      startDate: data.date,
      endDate: data.date,
      studyArea: data.studyArea,
      analysisType: 'single',
      dataSource: {
        id: data.id,
        name: data.name,
        date: template?.dataSource.date ?? data.date,
        productId: template?.dataSource.productId ?? 'DZ01V_L2_E110.3_N29.2_20251225031144_01_T1',
        spacecraft: template?.dataSource.spacecraft ?? 'DZ01',
        sensor: template?.dataSource.sensor ?? 'VNIR',
        bounds: template?.dataSource.bounds ?? { north: 29.509381, south: 28.971594, east: 110.617518, west: 110.024867 },
      },
      indicators: {
        organicMatter: {
          avg: template?.indicators.organicMatter.stats.avg ?? 47.3,
          min: template?.indicators.organicMatter.stats.min ?? 32.1,
          max: template?.indicators.organicMatter.stats.max ?? 65.8,
          std: template?.indicators.organicMatter.stats.std ?? 8.2,
          trend: template?.indicators.organicMatter.stats.trend ?? 'stable',
          status: template?.indicators.organicMatter.stats.status ?? 'good',
          description: template?.indicators.organicMatter.description ?? '东南部山地森林区有机质含量最高（峰值65.8 g/kg），得益于长期森林凋落物积累；中部农田区均值45.2 g/kg，保持稳定中高水平；西北部河谷区最低（32.1 g/kg），与砂质土壤保肥能力弱及盐渍化胁迫有关。全区41%面积有机质>50 g/kg（优质），34%面积在30-50 g/kg（良好），25%面积<30 g/kg（需改良）。有机质与含水量呈正相关（r=0.68）。',
        },
        moisture: {
          avg: template?.indicators.moisture.stats.avg ?? 35.2,
          min: template?.indicators.moisture.stats.min ?? 18.5,
          max: template?.indicators.moisture.stats.max ?? 52.7,
          std: template?.indicators.moisture.stats.std ?? 7.8,
          trend: template?.indicators.moisture.stats.trend ?? 'stable',
          status: template?.indicators.moisture.stats.status ?? 'good',
          description: template?.indicators.moisture.description ?? '东部森林区含水量最高（峰值52.7%），良好植被减少蒸发并增强入渗；中部农田区30-40%，墒情适宜多数作物；西北部河谷偏低（18.5-25%），砂质土渗透性强且蒸发量大。监测时段为冬季枯水期，夏季预计回升至42%左右。',
        },
        salinity: {
          level: template?.indicators.salinity.stats.level ?? 'light',
          area: template?.indicators.salinity.stats.area ?? '西北部河谷平原区域',
          coverage: template?.indicators.salinity.stats.coverage ?? '约12%（约3.2 km²）',
          status: template?.indicators.salinity.stats.status ?? 'warning',
          description: template?.indicators.salinity.description ?? '西北部河谷平原存在轻度盐渍化（全盐量2-4 g/kg），以硫酸盐-氯化物混合型为主。地下水位1.5-2.5m，矿化度较高。过去3年盐渍化面积年均扩张约0.8%，若不干预预计5年后将影响5 km²以上。',
        },
        totalNitrogen: { avg: 1.52, min: 0.95, max: 2.15, std: 0.31, trend: 'stable', status: 'good', description: '与有机质呈高度正相关（r=0.82），空间分布格局一致。东南部森林区最高（2.15 g/kg），西北部河谷区最低（0.95 g/kg）。总体上氮素供应充足，仅西北部约15%面积需适当补充。' },
        availablePhosphorus: { avg: 18.7, min: 8.2, max: 28.5, std: 7.2, trend: 'up', status: 'normal', description: '空间变异较大（CV=38.5%）。中部农田区由于长期施肥，有效磷含量最高（28.5 mg/kg）；东南森林区最低（8.2 mg/kg）。约30%区域低于10 mg/kg（缺乏），建议针对性补磷。' },
        availablePotassium: { avg: 95.3, min: 78.2, max: 132.5, std: 15.8, trend: 'down', status: 'warning', description: '中部农田区因连作消耗，速效钾含量较低（78.2 mg/kg），为全区最低值；东部森林区最高（132.5 mg/kg）。约35%区域低于80 mg/kg（缺乏），是当前限制土壤质量提升的主要营养短板。' },
        ndvi: { avg: 0.62, min: 0.25, max: 0.85, std: 0.14, trend: 'down', status: 'normal', description: '东部森林区NDVI最高（0.78-0.85）；中部农田区0.45-0.65（冬季休耕期）；西北部河谷区最低（0.25-0.40）。东南部坡地（约1.8 km²）NDVI较去年同期下降0.08，存在轻度植被退化和水土流失风险。' },
      },
      qualityScore: template?.qualityScore ?? 76,
      qualityLevel: template?.qualityLevel ?? '良好',
      summary: template?.summary ?? '该区域土壤质量整体处于良好水平。有机质丰富（47.3 g/kg）、含水量适中（35.2%）、全氮中上（1.52 g/kg）。但西北部河谷平原存在轻度盐渍化（3.2 km²，年增0.8%）；中部农田区速效钾偏低（78.2 mg/kg，35%区域缺乏）；东南坡地NDVI下降（1.8 km²，年降0.08），存在水土流失风险。',
      recommendations: template?.recommendations ?? [
        '【盐渍化治理 - 🔴紧急】西北部盐渍化区（3.2km²）实施排水工程 + 淋洗 + 石膏改良，3年降盐至1.5 g/kg以下。',
        '【精准施肥 - 🟡重要】A区N-P₂O₅-K₂O=12-8-10，B区15-10-15（重点补钾），C区18-12-12（补氮补磷）。有机肥2000-5000 kg/亩按区投放。',
        '【作物布局 - 🟡重要】C区选耐盐品种（海稻86等），B区玉米-大豆轮作，A区经济林。3年轮作制。',
        '【风险监测 - 🟡重要】建立12点监测网络（天-空-地一体化），季度遥感 + 月度无人机 + 每周地面采样。',
        '【科技推广 - 🟢常规】变量施肥（减化肥20-30%）、测土配方、EM菌应用、农技培训2-3次/年。',
      ],
      // 扩展数据
      managementZones: [
        { zoneId: 'A', zoneName: '优质保持区', area: '约10.7 km²', percentage: '40%', features: '有机质>50 g/kg，水分35-52%，无盐渍化，NDVI 0.78-0.85。山地森林与优质农田，土壤肥沃、结构良好。', recommendations: '维持现有有机肥施用（2000-3000 kg/亩/年），正常N-P-K施肥配方（12-8-10 kg/亩）。推广水肥一体化技术，提高水肥利用效率。', crops: '油茶、板栗、厚朴（经济林）；春玉米、优质水稻、蔬菜。' },
        { zoneId: 'B', zoneName: '培肥改良区', area: '约9.4 km²', percentage: '35%', features: '有机质30-50 g/kg，水分25-40%，速效钾偏低（78 mg/kg），有效磷18.7 mg/kg。中部丘陵农田，土壤条件尚可但有明显养分短板。', recommendations: '重点补钾（K₂O 8-12 kg/亩/年）+ 秸秆还田 + 绿肥种植。推广玉米-大豆轮作固氮培肥。深耕25-30cm打破犁底层。', crops: '春玉米（湘玉27号）、秋大豆、水稻、冬小麦、油菜。' },
        { zoneId: 'C', zoneName: '重点治理区', area: '约6.7 km²', percentage: '25%', features: '有机质<35 g/kg，水分18-25%，轻度盐渍化（2-4 g/kg），NDVI 0.25-0.40。西北部河谷平原，砂质土壤，排水不畅，盐渍化年均扩张0.8%。', recommendations: '紧急实施排水工程（渠深2.5-3.0m，间距100-150m）+ 灌水洗盐（2-3次/年，200-300mm/次）+ 增施有机肥4000-5000 kg/亩 + 石膏50-100 kg/亩。连续治理3年。', crops: '耐盐水稻（海稻86、盐丰47号）、向日葵、甜菜。盐碱地改良期种植碱蓬、田菁进行生物修复。' },
      ],
      cropSuitability: [
        { crop: '春玉米', matchLevel: 5, basis: '有机质充足，pH适宜（6.2-7.0），温度适中', yieldRange: '600-750 kg/亩', suitableZone: 'A区、B区' },
        { crop: '水稻', matchLevel: 4, basis: '水分条件好，但C区局部盐分偏高需选耐盐品种', yieldRange: '500-650 kg/亩', suitableZone: 'B区、C区（耐盐品种）' },
        { crop: '大豆', matchLevel: 4, basis: '有机质利于固氮，轮作培肥效果好', yieldRange: '180-250 kg/亩', suitableZone: 'A区、B区' },
        { crop: '油菜', matchLevel: 4, basis: '冬季作物，利用冬闲田，经济效益好', yieldRange: '150-200 kg/亩', suitableZone: 'B区' },
        { crop: '蔬菜类', matchLevel: 3, basis: 'B区土壤条件适宜，C区盐分超标不推荐', yieldRange: '因品种而异', suitableZone: 'A区、B区' },
      ],
      fertilizationPlans: [
        { zone: 'A区（优质区）', formula: 'N-P₂O₅-K₂O: 12-8-10 kg/亩', organicFertilizer: '2000-3000 kg/亩/年', topDressing: '玉米拔节期追尿素10-12 kg/亩', microElements: '基施硼砂0.5 kg/亩' },
        { zone: 'B区（改良区）', formula: 'N-P₂O₅-K₂O: 15-10-15 kg/亩', organicFertilizer: '3000-3500 kg/亩/年', topDressing: '玉米拔节期追尿素12-15 kg/亩', microElements: '基施硼砂0.5-1 kg/亩；补锌1 kg/亩' },
        { zone: 'C区（治理区）', formula: 'N-P₂O₅-K₂O: 18-12-12 kg/亩', organicFertilizer: '4000-5000 kg/亩/年', topDressing: '水稻分蘖期追尿素8-12 kg/亩', microElements: '硫酸锌1-2 kg/亩（砂质土易缺锌）' },
      ],
      riskWarnings: [
        { type: '盐渍化扩张', area: 'C区（西北部河谷）', indicator: '盐渍化面积年增长率', threshold: '年增>5%为🔴，1-5%为🟡', status: '中风险', emoji: '🟡', action: '立即实施排水洗盐工程，3-4月春灌淋洗' },
        { type: '速效钾持续下降', area: 'B区（中部农田）', indicator: 'AK年变化率', threshold: '年降>5 mg/kg为🟡', status: '中风险', emoji: '🟡', action: '增施钾肥8-12 kg/亩 + 秸秆还田' },
        { type: '坡地植被退化', area: '东南坡地（1.8 km²）', indicator: 'NDVI年变化率', threshold: '年降>0.1为🔴', status: '中风险', emoji: '🟡', action: '等高种植 + 退耕还林 + 水土保持工程' },
        { type: '有机质衰减', area: '全区', indicator: 'SOC年变化率', threshold: '年降>2 g/kg为🟡', status: '低风险', emoji: '🟢', action: '保持现有有机肥施用水平，持续监测' },
        { type: '土壤干旱化', area: '西北部 + 东南坡地', indicator: '含水量年变化率', threshold: '年降>5个百分点为🟡', status: '低风险', emoji: '🟢', action: '推广保墒技术 + 节水灌溉' },
      ],
      actionChecklist: [
        { priority: '🔴 紧急', action: 'C区排水工程：建设深度2.5-3.0m排水渠系（间距100-150m）', area: 'C区（西北部河谷）', timing: '2026年3月前完工', expectedEffect: '地下水位降至3m以下' },
        { priority: '🔴 紧急', action: '春灌淋洗：2-3次大水淋洗（200-300mm/次）+ 石膏50-100 kg/亩', area: 'C区', timing: '2026年3-4月', expectedEffect: '耕作层盐分降低30-40%' },
        { priority: '🟡 重要', action: '增施有机肥4000-5000 kg/亩 + 深耕25-30cm', area: 'C区', timing: '2026年秋季深耕', expectedEffect: '有机质年提升5-8 g/kg' },
        { priority: '🟡 重要', action: '增施钾肥（K₂O 8-12 kg/亩）+ 秸秆还田', area: 'B区', timing: '每季播种前', expectedEffect: '速效钾年提升10-15 mg/kg' },
        { priority: '🟡 重要', action: '建立12点土壤监测网络（3+5+4）+ 4个物联网墒情站', area: '全区', timing: '2026年上半年', expectedEffect: '实时掌握土壤动态' },
        { priority: '🟢 常规', action: '测土配方施肥：每季播种前检测 + 施肥建议卡到户', area: '全区', timing: '每季播种前', expectedEffect: '节肥15%，增产5-10%' },
        { priority: '🟢 常规', action: 'C区试验种植碱蓬、田菁进行生物修复', area: 'C区', timing: '2026年春季起', expectedEffect: '3年后土壤盐分降至1.5 g/kg' },
        { priority: '🟢 常规', action: '组织农技培训（土壤改良+精准施肥）2-3次/年', area: '全区', timing: '每年3月/6月/9月', expectedEffect: '农户科学种田水平提升' },
      ],
      cropGuides: [
        { crop: '水稻', suitableZones: 'B区（中部农田）、C区（耐盐品种）', variety: 'B区：Y两优9918、深两优5814；C区：海稻86、盐丰47号（耐盐度3-5 g/kg）', sowingTime: '中稻4月中下旬播种育秧，5月中下旬移栽；C区耐盐水稻5月上旬直播', sowingMethod: 'B区采用旱育秧+机插秧（行距30cm，株距15cm，每亩1.2-1.5万穴）；C区采用直播（每亩用种量2.5-3 kg）或抛秧', fertilizerPlan: '基肥（移栽前）：N-P₂O₅-K₂O=8-5-7 kg/亩 + 有机肥1000-1500 kg/亩。返青肥（移栽后5-7天）：尿素5 kg/亩。分蘖肥（移栽后15天）：尿素8-10 kg/亩。穗肥（抽穗前15天）：尿素3-5 kg/亩 + K₂O 3 kg/亩。C区减施20%氮肥，增施石膏20 kg/亩', waterManagement: '浅水插秧（2-3cm），深水返青（5-7cm），浅水分蘖（2-3cm），够苗晒田（分蘖末期排水晒田7-10天），有水孕穗（5-8cm），干湿交替灌浆。C区全生育期灌水深度增加2-3cm以压盐', pestControl: '苗期防稻蓟马（吡虫啉）；分蘖期防二化螟（氯虫苯甲酰胺）；抽穗期防稻瘟病（三环唑）+ 稻曲病（苯甲·丙环唑）。C区注意防治盐害引起的生理性赤枯病', expectedYield: 'B区 550-650 kg/亩；C区（耐盐品种）400-500 kg/亩', notes: 'C区种稻前务必完成排水洗盐，否则死苗率可达30-50%。收获后建议种植绿肥（紫云英）培肥地力' },
        { crop: '玉米', suitableZones: 'A区、B区（最佳适种区）', variety: '湘玉27号（早熟高产）、郑单958（稳产抗倒）、先玉335（耐密植）。东南坡地选抗旱品种', sowingTime: '春玉米3月下旬-4月上旬（土壤温度稳定通过10℃）；秋玉米7月中下旬', sowingMethod: '宽窄行种植（宽行80cm+窄行40cm），株距25-30cm，每亩3500-4200株。机械精量播种，每穴2粒，播深3-5cm。基肥侧深施（种侧5cm，深8-10cm）', fertilizerPlan: '基肥（播种时）：N-P₂O₅-K₂O=8-6-7 kg/亩 + 有机肥1500-2000 kg/亩。拔节期（6-7叶）：尿素10-15 kg/亩 + K₂O 3 kg/亩。大喇叭口期：尿素5-8 kg/亩。B区钾肥用量增加至10 kg/亩', waterManagement: '播种后浇透出苗水；拔节-抽雄期（需水临界期）保持土壤含水量25-35%，遇旱及时沟灌；灌浆期适当控水（防倒伏）。东南坡地建议覆盖地膜或秸秆保墒。A区如遇积水及时开沟排水', pestControl: '苗期防地老虎（辛硫磷拌种）；心叶期防玉米螟（BT制剂或氯虫苯甲酰胺灌心）；中后期防大斑病（丙环唑）+ 锈病（戊唑醇）。收获前30天停止用药', expectedYield: 'A区 650-750 kg/亩；B区 550-650 kg/亩', notes: '玉米忌连作，必须与大豆/绿肥/油菜轮作。B区重点补钾（K₂O增加到10 kg/亩），否则秃尖率增加。秸秆建议粉碎还田（500-600 kg/亩）配合尿素5-8 kg/亩调节C/N比' },
        { crop: '甘薯', suitableZones: 'A区、B区（砂壤土最宜）、C区（改良后）', variety: '商薯19（淀粉型，稳产）、普薯32（鲜食型，品质好）、龙薯9号（早熟，适合茬口紧的地块）。C区可试种耐瘠薄的苏薯8号', sowingTime: '4月中下旬育苗，5月下旬-6月上旬移栽（春薯）；7月下旬移栽（夏薯，前茬油菜/小麦收获后）', sowingMethod: '起垄栽培（垄宽70-80cm，垄高25-30cm，垄距90-100cm），株距20-25cm，每亩3500-4500株。斜插法（薯苗入土3-4节，深度5-8cm），栽后浇透定根水。建议覆盖黑色地膜（防草+保墒+增温）', fertilizerPlan: '基肥（起垄时）：N-P₂O₅-K₂O=5-5-12 kg/亩 + 有机肥1500-2000 kg/亩（甘薯需钾量高！）。移栽后15天：尿素3-5 kg/亩（提苗）。薯块膨大期（栽后60天）：K₂O 5-8 kg/亩（硫酸钾，促薯块膨大）。忌施含氯肥料（氯化钾等），否则薯块品质下降', waterManagement: '移栽后保持土壤湿润7-10天（成活率关键）；分枝结薯期（栽后20-40天）适当控水促根系下扎；薯块膨大期（栽后40-90天）保持土壤含水量30-40%；收获前20天停止灌水（防薯块含水量过高不耐贮藏）。坡地建议建小型集雨窖', pestControl: '苗期防甘薯天蛾（高效氯氰菊酯）；地下害虫（蛴螬、蝼蛄）用辛硫磷颗粒剂拌土施入垄内；中后期防甘薯瘟病（轮作+选用抗病品种）。主要靠轮作预防，连作不超过2年', expectedYield: 'A区 2500-3500 kg/亩（鲜薯）；B区 2000-2800 kg/亩', notes: '甘薯是优秀的"先锋作物"，可在C区改盐第一年试种，耐瘠薄。收获后藤蔓是优质青饲料。切忌与番茄/辣椒/烟草等茄科作物连作（共患病害）' },
        { crop: '油菜', suitableZones: 'B区（冬季主要作物）、A区', variety: '湘杂油763（高产双低）、中双11号（抗倒耐密）、丰油730（早熟，适合稻-油轮作）。B区推荐早熟品种，不耽误下茬玉米', sowingTime: '9月中下旬育苗，10月中下旬移栽；或10月上旬直播（稻-油轮作区在水稻收获后抢墒直播）', sowingMethod: '育苗移栽：苗床播种量0.5 kg/亩，苗龄30-35天，移栽密度每亩6000-8000株（行距40cm，株距20-25cm）。直播：每亩用种量0.3-0.4 kg，条播或撒播，播后浅覆土1-2cm。建议机械直播+开沟一体作业', fertilizerPlan: '基肥：N-P₂O₅-K₂O=8-5-6 kg/亩 + 有机肥1000-1500 kg/亩 + 硼砂0.5-1 kg/亩（油菜需硼，缺硼"花而不实"！）。苗期（3-5叶）：尿素5-8 kg/亩。薹期（抽薹10-15cm）：尿素3-5 kg/亩 + K₂O 3 kg/亩。初花期喷施0.2%硼砂溶液（叶面肥）', waterManagement: '播种/移栽后浇透水保成活；苗期保持土壤湿润（防旱+防涝）；薹期-花期（需水高峰期）遇旱沟灌；角果成熟期适当控水（防倒伏+菌核病）。B区低洼田块务必开好"三沟"（围沟、腰沟、厢沟）排水', pestControl: '苗期防蚜虫（吡虫啉）+ 菜青虫（BT制剂）；花期重点防菌核病（菌核净或多菌灵，初花期和盛花期各喷1次）；角果期防蚜虫传播病毒病。收获前20天停止用药', expectedYield: 'B区 160-200 kg/亩；A区 180-220 kg/亩', notes: '油菜是优秀的冬季覆盖作物和水稻/玉米前茬，根系能活化土壤磷钾。秸秆还田可增加土壤有机质。双低品种（低芥酸、低硫苷）菜籽收购价更高。与水稻轮作可显著减轻水稻病虫' },
        { crop: '豆类（大豆/绿豆）', suitableZones: 'A区、B区（轮作核心作物）', variety: '大豆：湘春豆28号（春播）、湘秋豆5号（秋播）、中黄13（高蛋白）。绿豆：中绿1号（早熟）、鄂绿4号（抗病）。C区改良后可种田菁（绿肥兼用）', sowingTime: '春大豆3月下旬-4月上旬；夏大豆6月上中旬（油菜/小麦收获后）；秋大豆7月中下旬（早稻收获后）。绿豆4-8月均可播种', sowingMethod: '大豆：条播行距40-50cm，株距10-15cm，每亩1.2-1.8万株；或穴播（行距40cm×穴距25cm，每穴留2-3株）。绿豆：条播行距40cm，株距15-20cm。播深3-4cm，播后轻镇压。接种根瘤菌可增产15-25%', fertilizerPlan: '大豆施肥"减氮增磷钾"：基肥N-P₂O₅-K₂O=3-8-8 kg/亩 + 有机肥1000-1500 kg/亩（大豆根瘤固氮，化学氮肥只需常规用量的1/3！）。苗期不追氮肥（氮多反而抑制根瘤）。花荚期：喷施0.2%磷酸二氢钾 + 0.1%钼酸铵（叶面肥，促结荚饱粒）。绿豆施肥参照减半', waterManagement: '播种时土壤含水量25-30%保证出苗；苗期适当控水（蹲苗促根）；花荚期（需水临界期）保持土壤含水量30-35%，遇旱沟灌（忌大水漫灌，易落花落荚）；鼓粒-成熟期减少灌水。多雨季节及时排涝（大豆最怕渍水）', pestControl: '苗期防豆荚螟（高效氯氟氰菊酯）+ 蚜虫（吡虫啉）；花荚期重点防豆荚螟和食心虫；中后期防锈病（戊唑醇）+ 霜霉病（代森锰锌）。绿豆注意防豆象（收获后及时晒干密封贮藏）', expectedYield: '大豆：A区 200-260 kg/亩；B区 160-220 kg/亩。绿豆：100-150 kg/亩', notes: '大豆是全区最重要的养地作物——每亩大豆可固氮5-8 kg（相当于尿素11-17 kg），后茬玉米可减施氮肥20%。C区盐分降至2 g/kg以下后可试种田菁（耐盐绿肥），先培肥再种大豆' },
      ],
    }

    return { report: baseReport, evidenceData }
  } else {
    return {
      report: {
        id: reportId,
        name: '土壤质量时序分析报告',
        createTime: dateStr,
        startDate: '2024-01-01',
        endDate: dateStr,
        studyArea: '监测区域',
        analysisType: 'timeseries',
        indicators: {
          organicMatter: { avg: 43.5, trend: 'up', status: 'good' },
          moisture: { avg: 31.8, trend: 'stable', status: 'normal' },
          salinity: { level: 'moderate', area: '东部', status: 'warning' },
        },
        qualityScore: 72,
        qualityLevel: '中等',
        summary: '时序分析功能开发中...',
        recommendations: ['持续监测土壤质量变化'],
      },
    }
  }
}

// DOCX 图片路径配置
const DOCX_IMAGE_PATHS: Record<string, string> = {
  rgb: '/demo_bundle/raw/raw_rgb_preview.png',
  oc: '/demo_bundle/results/pred_OC_0-5cm_1km_mean_preview.png',
  tn: '/demo_bundle/results/pred_TN_0-5cm_1km_mean_preview.png',
  tp: '/demo_bundle/results/pred_TP_0-5cm_1km_mean_preview.png',
  ndvi: '/demo_bundle/processed/ndvi_preview.png',
  dem: '/demo_bundle/processed/dem_preview.png',
  unc: '/demo_bundle/results/unc_OC_0-5cm_1km_mean_preview.png',
}

// 为报告数据加载图片
const enrichReportWithImages = async (report: ReportData): Promise<ReportData> => {
  const imageBuffers = await loadImageBuffers(DOCX_IMAGE_PATHS)
  return { ...report, imageBuffers }
}

// 触发 DOCX 预览
const triggerDocxPreview = async () => {
  if (!docxPreviewContainer.value || !currentReport.value) return
  await nextTick()
  const enriched = await enrichReportWithImages(currentReport.value as ReportData)
  await previewReport(enriched, docxPreviewContainer.value)
}

// 监听报告切换，自动刷新 DOCX 预览
watch(() => currentReport.value, (newReport) => {
  if (newReport) {
    triggerDocxPreview()
  }
})

const handleExport = async () => {
  if (!currentReport.value) {
    ElMessage.warning('请先选择或生成一份报告')
    return
  }

  exportLoading.value = true

  try {
    if (exportFormat.value === 'docx') {
      const enriched = await enrichReportWithImages(currentReport.value as ReportData)
      await downloadDocx(enriched)
      ElMessage.success('DOCX 报告已生成并开始下载！')
    } else if (exportFormat.value === 'pdf') {
      ElMessage.info('PDF 导出：请使用浏览器「打印为 PDF」（Ctrl+P）将 DOCX 预览输出为 PDF。')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '导出失败'
    ElMessage.error(`导出失败：${message}`)
    console.error('报告导出错误：', err)
  } finally {
    exportLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.report-page {
  height: calc(100vh - 100px);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.catalog-card {
  height: 100%;

  .report-menu {
    border-right: none;
  }
}

.preview-card {
  height: 100%;

  :deep(.el-card__body) {
    height: calc(100% - 60px);
    overflow: auto;
  }
}

.export-card {
  height: 100%;
}

.data-option {
  .data-name {
    font-size: 14px;
    color: #303133;
    margin-bottom: 4px;
  }

  .data-id {
    font-size: 12px;
    color: #909399;
    font-family: 'Courier New', monospace;
  }
}

// DOCX 预览样式
.docx-preview-wrapper {
  height: 100%;
  overflow: auto;
  background: #f5f7fa;
  border-radius: 4px;
}

.docx-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #606266;
  font-size: 15px;
  gap: 12px;

  .is-loading {
    font-size: 32px;
    color: #409eff;
    animation: rotating 1.5s linear infinite;
  }
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.docx-error {
  padding: 20px;
}

.docx-preview-container {
  min-height: 400px;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.is-ready {
    opacity: 1;
  }

  // docx-preview 渲染后的样式覆盖
  :deep(.docx-preview) {
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    margin: 0 auto;
    max-width: 210mm; // A4 宽度
    padding: 0;

    .docx-wrapper {
      background: white;
      padding: 20px;
    }

    // 表格样式
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;

      td, th {
        border: 1px solid #d0d0d0;
        padding: 6px 10px;
        font-size: 13px;
      }

      th {
        background: #1F4E79;
        color: white;
        font-weight: bold;
      }

      tr:nth-child(even) td {
        background: #f8f9fa;
      }
    }

    // 标题样式
    h1 { font-size: 28px; color: #1F4E79; }
    h2 { font-size: 22px; color: #1F4E79; border-bottom: 2px solid #2E75B6; padding-bottom: 6px; }
    h3 { font-size: 18px; color: #2E75B6; }
    p { line-height: 1.8; font-size: 14px; color: #333; }
  }
}
</style>
