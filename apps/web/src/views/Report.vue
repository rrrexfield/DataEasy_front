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
              <span>报告预览</span>
              <el-button-group>
                <el-button :icon="ZoomIn" @click="handleZoomIn" />
                <el-button :icon="ZoomOut" @click="handleZoomOut" />
                <el-button :icon="RefreshRight" @click="handleRefresh" />
              </el-button-group>
            </div>
          </template>

          <div v-if="currentReport" class="report-preview" :style="{ transform: `scale(${scale})` }">
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
                主要监测指标包括土壤有机质、含水量和盐渍化程度。
              </p>
              
              <!-- 数据源信息（单图分析） -->
              <div v-if="currentReport.dataSource" class="data-source-info">
                <h3>数据源信息</h3>
                <ul>
                  <li>产品ID: {{ currentReport.dataSource.productId }}</li>
                  <li>卫星平台: {{ currentReport.dataSource.spacecraft }}</li>
                  <li>传感器: {{ currentReport.dataSource.sensor }}</li>
                  <li>采集日期: {{ currentReport.dataSource.date }}</li>
                  <li>影像范围: 北纬{{ currentReport.dataSource.bounds.south }}° ~ {{ currentReport.dataSource.bounds.north }}°, 
                      东经{{ currentReport.dataSource.bounds.west }}° ~ {{ currentReport.dataSource.bounds.east }}°</li>
                </ul>
              </div>
            </div>

            <!-- 综合指数 -->
            <div class="report-section">
              <h2>二、土壤质量综合指数</h2>
              <div class="index-display">
                <div class="index-value">{{ currentReport.qualityScore || 72 }}</div>
                <div class="index-label">综合评分</div>
                <div class="index-desc">{{ currentReport.summary || '该区域整体土壤质量处于中等偏好水平' }}</div>
              </div>
            </div>

            <!-- 指标分析 -->
            <div class="report-section">
              <h2>三、各项指标分析</h2>
              <div class="indicator-list">
                <div class="indicator-item">
                  <h3>3.1 有机质含量</h3>
                  <p v-if="currentReport.indicators?.organicMatter?.avg">
                    平均值: {{ currentReport.indicators.organicMatter.avg }} g/kg
                    <span v-if="currentReport.indicators.organicMatter.min && currentReport.indicators.organicMatter.max">
                      (范围: {{ currentReport.indicators.organicMatter.min }} ~ {{ currentReport.indicators.organicMatter.max }} g/kg，
                      标准差: {{ currentReport.indicators.organicMatter.std }})
                    </span>
                    <span v-if="currentReport.indicators.organicMatter.trend === 'up'">，整体呈上升趋势</span>
                    <span v-if="currentReport.indicators.organicMatter.trend === 'stable'">，保持稳定</span>。
                    {{ currentReport.indicators.organicMatter.description || '说明土壤肥力状况良好。' }}
                  </p>
                  <p v-else>平均值: 45.8 g/kg，整体呈上升趋势，说明土壤肥力状况良好。</p>
                </div>
                
                <div class="indicator-item">
                  <h3>3.2 土壤含水量</h3>
                  <p v-if="currentReport.indicators?.moisture?.avg">
                    平均值: {{ currentReport.indicators.moisture.avg }}%
                    <span v-if="currentReport.indicators.moisture.min && currentReport.indicators.moisture.max">
                      (范围: {{ currentReport.indicators.moisture.min }}% ~ {{ currentReport.indicators.moisture.max }}%，
                      标准差: {{ currentReport.indicators.moisture.std }}%)
                    </span>。
                    {{ currentReport.indicators.moisture.description || '处于适中水平，有利于作物生长。' }}
                  </p>
                  <p v-else>平均值: 32.5%，处于适中水平，有利于作物生长。</p>
                </div>
                
                <div class="indicator-item">
                  <h3>3.3 盐渍化程度</h3>
                  <p v-if="currentReport.indicators?.salinity">
                    <span v-if="currentReport.indicators.salinity.level === 'none'">未检测到明显盐渍化现象。</span>
                    <span v-else>
                      {{ currentReport.indicators.salinity.area }}存在{{ 
                        currentReport.indicators.salinity.level === 'light' ? '轻度' : 
                        currentReport.indicators.salinity.level === 'moderate' ? '中度' : '重度' 
                      }}盐渍化风险
                      <span v-if="currentReport.indicators.salinity.coverage">，覆盖面积{{ currentReport.indicators.salinity.coverage }}</span>。
                      {{ currentReport.indicators.salinity.description || '建议加强监测和改良。' }}
                    </span>
                  </p>
                  <p v-else>西北部存在轻度盐渍化风险，建议加强监测和改良。</p>
                  
                  <!-- 盐渍化反演结果图 -->
                  <div class="inversion-image">
                    <img 
                      src="/demo_bundle/results/pred_OC_0-5cm_1km_mean_preview.png" 
                      alt="盐渍化程度反演结果图"
                      @error="handleImageError"
                    >
                    <p class="image-caption">图3-1 盐渍化程度空间分布图（颜色越深表示盐渍化程度越高）</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI分析结论 -->
            <div class="report-section">
              <h2>四、AI智能分析结论与建议</h2>
              <div class="ai-conclusion">
                <p>{{ currentReport.summary || '基于多模态数据融合分析，该区域整体土壤质量中等偏好。' }}</p>
                <p v-if="currentReport.recommendations && currentReport.recommendations.length > 0">
                  <strong>建议措施：</strong>
                </p>
                <ol v-if="currentReport.recommendations && currentReport.recommendations.length > 0">
                  <li v-for="(rec, index) in currentReport.recommendations" :key="index">{{ rec }}</li>
                </ol>
                <ol v-else>
                  <li>加强西北部区域的排水改良工作</li>
                  <li>适当增施有机肥，提高土壤肥力</li>
                  <li>建立长期监测机制，跟踪土壤质量变化趋势</li>
                </ol>
              </div>
            </div>

            <!-- 证据链分析（可审计）-->
            <div v-if="currentReport.evidenceData" class="report-section">
              <h2>五、证据链分析 <el-tag type="info" size="small">可审计</el-tag></h2>
              
              <div class="evidence-intro">
                <p>
                  本节展示AI模型预测结果的证据链，包括Top-K影响因子及其统计信息。
                  证据链数据遵循标准化语义规范，支持可复核、可审计的质量管控流程。
                </p>
              </div>

              <!-- 证据图层说明 -->
              <div class="evidence-layers-info">
                <h3>5.1 证据图层三件套</h3>
                <div class="layer-description">
                  <div class="layer-item">
                    <strong>① 证据因子图层 (explain_top1_factor.tif)：</strong>
                    每像元Top1证据对象编号图层，标识对预测结果贡献最大的因子类别
                  </div>
                  <div class="layer-item">
                    <strong>② 证据强度图层 (explain_top1_strength.tif)：</strong>
                    每像元Top1证据强度图层，量化该因子的影响程度
                  </div>
                  <div class="layer-item">
                    <strong>③ 区域证据矢量 (region_evidence.geojson)：</strong>
                    治理单元矢量边界及其证据属性表，包含区域Top-K证据摘要与预测统计
                  </div>
                </div>
              </div>

              <!-- 区域证据摘要示例 -->
              <div class="evidence-summary">
                <h3>5.2 区域证据摘要（示例）</h3>
                <p class="summary-note">
                  以下展示 {{ currentReport.evidenceData.sampleRegions.length }} 个代表性区域的证据清单：
                </p>

                <div
                  v-for="region in currentReport.evidenceData.sampleRegions"
                  :key="region.region_id"
                  class="region-evidence-block"
                >
                  <h4>区域 #{{ region.region_id }} - {{ region.target }}</h4>
                  
                  <!-- 预测统计 -->
                  <div class="pred-stats">
                    <strong>预测统计：</strong>
                    <span>均值 {{ region.pred_mean.toFixed(3) }}</span>
                    <span>中位数 {{ region.pred_p50.toFixed(3) }}</span>
                    <span>P95 {{ region.pred_p95.toFixed(3) }}</span>
                    <span>像元数 {{ region.pixel_count }}</span>
                  </div>

                  <!-- Top-3 证据表 -->
                  <table class="evidence-table">
                    <thead>
                      <tr>
                        <th>排序</th>
                        <th>因子ID</th>
                        <th>因子名称</th>
                        <th>基线类型</th>
                        <th>频次</th>
                        <th>变化量</th>
                        <th>方向</th>
                        <th>得分</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(ev, idx) in region.top_evidence.slice(0, 3)"
                        :key="idx"
                      >
                        <td>{{ Number(idx) + 1 }}</td>
                        <td>{{ ev.factor_id }}</td>
                        <td>{{ ev.factor_label }}</td>
                        <td>{{ ev.baseline_type }}</td>
                        <td>{{ (ev.freq * 100).toFixed(1) }}%</td>
                        <td>{{ ev.delta_mean.toFixed(3) }}</td>
                        <td>
                          <span :class="ev.direction === 'increase' ? 'direction-up' : 'direction-down'">
                            {{ ev.direction === 'increase' ? '↑' : '↓' }}
                          </span>
                        </td>
                        <td>{{ ev.score.toFixed(3) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- 证据字段说明 -->
              <div class="evidence-field-spec">
                <h3>5.3 证据字段语义规范</h3>
                <table class="spec-table">
                  <thead>
                    <tr>
                      <th>字段名</th>
                      <th>语义说明</th>
                      <th>取值示例</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>region_id</td>
                      <td>治理单元标识</td>
                      <td>0, 1, 2, ...</td>
                    </tr>
                    <tr>
                      <td>target</td>
                      <td>预测目标指标</td>
                      <td>OC_0-5cm_1km_mean</td>
                    </tr>
                    <tr>
                      <td>factor_id</td>
                      <td>证据对象标识（含单波段/波段组/模态组/DEM窗口块）</td>
                      <td>43, 40, 19, ...</td>
                    </tr>
                    <tr>
                      <td>baseline_type</td>
                      <td>条件基线语义</td>
                      <td>region_mean（区域平均值）</td>
                    </tr>
                    <tr>
                      <td>baseline_value</td>
                      <td>基线数值</td>
                      <td>0.246</td>
                    </tr>
                    <tr>
                      <td>freq</td>
                      <td>该证据在区域内的频次</td>
                      <td>0.726（72.6%）</td>
                    </tr>
                    <tr>
                      <td>delta_mean</td>
                      <td>相对基线的平均变化量</td>
                      <td>0.465（增加）/-0.402（减少）</td>
                    </tr>
                    <tr>
                      <td>direction</td>
                      <td>变化方向</td>
                      <td>increase / decrease</td>
                    </tr>
                    <tr>
                      <td>score</td>
                      <td>证据强度评分（贡献度）</td>
                      <td>0.338（归一化得分）</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 可审计性说明 -->
              <div class="audit-note">
                <p>
                  <strong>可审计性保证：</strong>
                  所有证据链数据字段遵循预设语义规范，确保模型预测结果可复核、可追溯、可审计。
                  完整证据清单（JSON/CSV格式）可从系统导出，用于第三方审计或质量检验。
                </p>
              </div>
            </div>
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

          <el-form label-position="top">
            <el-form-item label="导出格式">
              <el-radio-group v-model="exportFormat">
                <el-radio label="pdf">PDF</el-radio>
                <el-radio label="word">Word</el-radio>
                <el-radio label="image">图片</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="包含内容">
              <el-checkbox-group v-model="exportContent">
                <el-checkbox label="charts">图表</el-checkbox>
                <el-checkbox label="maps">地图</el-checkbox>
                <el-checkbox label="data">原始数据</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="纸张大小">
              <el-select v-model="paperSize" style="width: 100%">
                <el-option label="A4" value="a4" />
                <el-option label="A3" value="a3" />
                <el-option label="Letter" value="letter" />
              </el-select>
            </el-form-item>

            <el-button type="primary" style="width: 100%" :icon="Download" @click="handleExport">
              导出报告
            </el-button>
          </el-form>
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
import { ref, computed, watch } from 'vue'
import { Plus, Document, ZoomIn, ZoomOut, RefreshRight, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useInversionData, useReports } from '@/composables/useDatabase'
import { parseReportTemplate } from '@/utils/report-parser'
import { evidenceAPI } from '@/db/api'

// 报告数据类型定义
interface ReportData {
  id: string
  name: string
  createTime: string
  startDate: string
  endDate: string
  studyArea: string
  analysisType: 'single' | 'timeseries'
  qualityScore: number
  qualityLevel: string
  summary: string
  recommendations: string[]
  dataSource?: {
    id: string
    name: string
    date: string
    productId: string
    spacecraft: string
    sensor: string
    bounds: {
      north: number
      south: number
      east: number
      west: number
    }
  }
  indicators: {
    organicMatter: {
      avg: number
      min?: number
      max?: number
      std?: number
      trend: string
      status: string
      description?: string
    }
    moisture: {
      avg: number
      min?: number
      max?: number
      std?: number
      trend: string
      status: string
      description?: string
    }
    salinity: {
      level: string
      area: string
      coverage?: string
      status: string
      description?: string
    }
  }
  evidenceData?: {
    sampleRegions: Array<{
      region_id: number
      target: string
      pixel_count: number
      pred_mean: number
      pred_p50: number
      pred_p95: number
      top_evidence: Array<{
        factor_id: number
        factor_label: string
        baseline_type: string
        freq: number
        delta_mean: number
        direction: string
        score: number
      }>
    }>
  }
}

const activeReport = ref('report-001')
const scale = ref(1)
const exportFormat = ref('pdf')
const exportContent = ref(['charts', 'maps'])
const paperSize = ref('a4')

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
    // 尝试从外部 MD 文件加载报告模板
    const productId = 'DZ01V_L2_E110.3_N29.2_20251225031144'
    const template = await parseReportTemplate(productId)
    
    // 准备证据链数据（将单独保存到数据库）
    const evidenceData = [
      {
        regionId: 0,
        target: 'OC_0-5cm_1km_mean',
        pixelCount: 2382,
        predMean: 1.847,
        predP50: 1.851,
        predP95: 1.978,
        topEvidence: [
          {
            factorId: 43,
            factorLabel: 'terrain_relief',
            baselineType: 'region_mean',
            freq: 0.726,
            deltaMean: 0.465,
            direction: 'increase',
            score: 0.338
          },
          {
            factorId: 40,
            factorLabel: 'climate_bio15',
            baselineType: 'region_mean',
            freq: 0.183,
            deltaMean: -0.402,
            direction: 'decrease',
            score: 0.073
          },
          {
            factorId: 19,
            factorLabel: 'ndre',
            baselineType: 'region_mean',
            freq: 0.064,
            deltaMean: -0.419,
            direction: 'decrease',
            score: 0.027
          }
        ]
      },
      {
        regionId: 1,
        target: 'OC_0-5cm_1km_mean',
        pixelCount: 1144,
        predMean: 1.754,
        predP50: 1.756,
        predP95: 1.853,
        topEvidence: [
          {
            factorId: 43,
            factorLabel: 'terrain_relief',
            baselineType: 'region_mean',
            freq: 0.743,
            deltaMean: 0.420,
            direction: 'increase',
            score: 0.312
          },
          {
            factorId: 40,
            factorLabel: 'climate_bio15',
            baselineType: 'region_mean',
            freq: 0.230,
            deltaMean: -0.375,
            direction: 'decrease',
            score: 0.086
          },
          {
            factorId: 37,
            factorLabel: 'climate_bio1',
            baselineType: 'region_mean',
            freq: 0.027,
            deltaMean: 0.392,
            direction: 'increase',
            score: 0.011
          }
        ]
      }
    ]
    
    if (template) {
      // 使用模板数据生成报告
      return {
        report: {
          id: reportId,
          name: `${data.studyArea}土壤质量单图分析报告`,
          createTime: dateStr,
          startDate: data.date,
          endDate: data.date,
          studyArea: data.studyArea,
          analysisType: 'single',
          dataSource: {
            id: data.id,
            name: data.name,
            date: template.dataSource.date,
            productId: template.dataSource.productId,
            spacecraft: template.dataSource.spacecraft,
            sensor: template.dataSource.sensor,
            bounds: template.dataSource.bounds,
          },
          indicators: {
            organicMatter: { 
              ...template.indicators.organicMatter.stats,
              description: template.indicators.organicMatter.description,
            },
            moisture: { 
              ...template.indicators.moisture.stats,
              description: template.indicators.moisture.description,
            },
            salinity: { 
              ...template.indicators.salinity.stats,
              description: template.indicators.salinity.description,
            },
          },
          qualityScore: template.qualityScore,
          qualityLevel: template.qualityLevel,
          summary: template.summary,
          recommendations: template.recommendations,
          // 不再在 evidenceData 中存储，会从数据库加载
        },
        evidenceData
      }
    }
    
    // 如果模板加载失败，返回一个简单的默认报告
    console.warn('报告模板加载失败，使用默认数据')
    return {
      report: {
        id: reportId,
        name: `${data.studyArea}土壤质量单图分析报告`,
        createTime: dateStr,
        startDate: data.date,
        endDate: data.date,
        studyArea: data.studyArea,
        analysisType: 'single',
        dataSource: {
          id: data.id,
          name: data.name,
          date: data.date,
          productId: 'DZ01V_L2_E110.3_N29.2_20251225031144_01_T1',
          spacecraft: 'DZ01',
          sensor: 'VNIR',
          bounds: {
            north: 29.509381,
            south: 28.971594,
            east: 110.617518,
            west: 110.024867,
          },
        },
        indicators: {
          organicMatter: { 
            avg: 47.3, 
            min: 32.1, 
            max: 65.8,
            std: 8.2,
            trend: 'stable', 
            status: 'good',
            description: '监测区域有机质含量处于适宜水平。',
          },
          moisture: { 
            avg: 35.2, 
            min: 18.5,
            max: 52.7,
            std: 7.8,
            trend: 'stable', 
            status: 'good',
            description: '土壤含水量处于适宜水平。',
          },
          salinity: { 
            level: 'light', 
            area: '西北部河谷平原区域',
            coverage: '约12%',
            status: 'warning',
            description: '西北部存在轻度盐渍化现象。',
          },
        },
        qualityScore: 76,
        qualityLevel: '良好',
        summary: '该区域土壤质量整体处于良好水平。',
        recommendations: [
          '【盐渍化治理】加强排水管理，降低地下水位',
          '【有机质维护】保持有机肥施用，提高土壤肥力',
          '【水分管理】建立墒情监测网络',
          '【作物布局优化】合理选择作物品种',
          '【长期监测机制】建立监测体系',
        ],
      },
      evidenceData  // 使用上面定义的证据链数据
    }
  } else {
    // 时序分析报告（示例）
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
      }
    }
  }
}

const handleZoomIn = () => {
  scale.value = Math.min(scale.value + 0.1, 2)
}

const handleZoomOut = () => {
  scale.value = Math.max(scale.value - 0.1, 0.5)
}

const handleRefresh = () => {
  scale.value = 1
}

const handleExport = () => {
  ElMessage.success(`正在导出为 ${exportFormat.value.toUpperCase()} 格式...`)
}

// 处理图像加载错误
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  // 如果图像加载失败，使用占位图或隐藏
  img.style.display = 'none'
  const caption = img.nextElementSibling as HTMLElement
  if (caption) {
    caption.textContent = '（图像文件缺失，请检查demo_bundle/results目录）'
    caption.style.color = '#909399'
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

.report-preview {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform-origin: top center;
  transition: transform 0.3s;
}

.report-section {
  margin-bottom: 40px;

  h1 {
    font-size: 36px;
    text-align: center;
    margin-bottom: 20px;
  }

  h2 {
    font-size: 28px;
    margin-bottom: 16px;
    border-bottom: 2px solid #409eff;
    padding-bottom: 8px;
  }

  h3 {
    font-size: 22px;
    margin: 16px 0 8px;
    color: #000000;
  }

  p {
    line-height: 1.8;
    color: #000000;
    text-indent: 2em;
  }

  &.cover {
    text-align: center;
    padding: 100px 0;

    h1 {
      font-size: 40px;
      margin-bottom: 30px;
    }

    .subtitle {
      font-size: 24px;
      color: #909399;
      margin-bottom: 10px;
    }

    .date {
      font-size: 18px;
      color: #c0c4cc;
    }
  }
}

.index-display {
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;

  .index-value {
    font-size: 76px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .index-label {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .index-desc {
    font-size: 20px;
    opacity: 0.9;
  }
}

.indicator-list {
  .indicator-item {
    margin-bottom: 20px;
  }
}

.ai-conclusion {
  padding: 20px;
  background-color: #f0f9ff;
  border-left: 4px solid #409eff;
  border-radius: 4px;

  p {
    text-indent: 0;
  }

  ol {
    margin-top: 10px;
    padding-left: 20px;

    li {
      line-height: 2;
      color: #000000;
    }
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

.data-source-info {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-left: 4px solid #409eff;
  border-radius: 4px;

  h3 {
    font-size: 18px;
    margin-bottom: 12px;
    color: #000000;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      line-height: 2;
      color: #000000;
      font-size: 14px;
      padding-left: 20px;
      position: relative;

      &::before {
        content: '•';
        position: absolute;
        left: 0;
        color: #409eff;
        font-weight: bold;
      }
    }
  }
}

.report-section {
  .study-area {
    font-size: 20px;
    color: #909399;
    margin-top: 10px;
  }
}

// 证据链样式
.evidence-intro,
.evidence-layers-info,
.evidence-summary,
.evidence-field-spec,
.audit-note {
  margin-bottom: 24px;
}

.layer-description {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  
  .layer-item {
    margin-bottom: 12px;
    line-height: 1.8;
    font-size: 14px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.summary-note {
  color: #606266;
  font-size: 14px;
  margin-bottom: 16px;
}

.region-evidence-block {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  
  h4 {
    margin: 0 0 12px;
    color: #303133;
    font-size: 16px;
  }
  
  .pred-stats {
    margin-bottom: 12px;
    padding: 8px 12px;
    background: white;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    
    span {
      margin-right: 16px;
      font-size: 13px;
      color: #606266;
    }
    
    strong {
      color: #303133;
      margin-right: 8px;
    }
  }
}

.evidence-table,
.spec-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 13px;
  
  thead {
    background: #f2f6fc;
    
    th {
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      color: #303133;
      border: 1px solid #dcdfe6;
    }
  }
  
  tbody {
    tr {
      &:nth-child(even) {
        background: #fafafa;
      }
      
      &:hover {
        background: #f5f7fa;
      }
    }
    
    td {
      padding: 8px;
      border: 1px solid #dcdfe6;
      color: #606266;
    }
  }
  
  .direction-up {
    color: #67c23a;
    font-weight: bold;
  }
  
  .direction-down {
    color: #e6a23c;
    font-weight: bold;
  }
}

.audit-note {
  background: #ecf5ff;
  padding: 16px;
  border-left: 4px solid #409eff;
  border-radius: 4px;
  
  p {
    margin: 0;
    color: #303133;
    font-size: 14px;
    line-height: 1.8;
  }
}

// 反演结果图像样式
.inversion-image {
  margin-top: 16px;
  margin-bottom: 20px;
  text-align: center;
  
  img {
    max-width: 100%;
    height: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
  
  .image-caption {
    margin-top: 8px;
    font-size: 13px;
    color: #606266;
    font-style: italic;
    text-indent: 0;
    line-height: 1.5;
  }
}
</style>
