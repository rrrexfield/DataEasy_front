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
import { ref, computed } from 'vue'
import { Plus, Document, ZoomIn, ZoomOut, RefreshRight, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 报告数据类型定义
interface ReportData {
  id: string
  name: string
  createTime: string
  startDate: string
  endDate: string
  studyArea: string
  analysisType: string
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

// 可选的反演数据列表
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
])

// 是否显示数据选择
const showDataSelect = computed(() => analysisType.value === 'single')

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

const currentReport = ref<ReportData>(reportList.value[0])

const handleSelectReport = (id: string) => {
  const found = reportList.value.find(r => r.id === id)
  if (found) {
    currentReport.value = found
  }
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
const handleConfirmGenerate = () => {
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

  // 生成新报告
  const newReport = generateReport(analysisType.value, selectedData)
  
  // 添加到报告列表
  reportList.value.unshift(newReport)
  
  // 选中新报告
  activeReport.value = newReport.id
  currentReport.value = newReport
  
  // 关闭对话框
  dialogVisible.value = false
  
  ElMessage.success('报告生成成功！')
}

// 生成报告内容
const generateReport = (type: 'single' | 'timeseries', data?: any): ReportData => {
  const reportId = generateReportId()
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  
  if (type === 'single' && data) {
    // 基于DZ01V数据生成单图分析报告
    return {
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
          description: '监测区域有机质含量平均为47.3 g/kg，整体处于较高水平。空间分布呈现明显的梯度特征，东南部山地森林区有机质含量最高，达到65.8 g/kg，主要得益于长期的森林植被覆盖和凋落物积累。中部农田区平均含量为45.2 g/kg，保持稳定的中高水平。西北部河谷地带含量相对较低，约为32.1 g/kg。相比于全国平均水平（25-30 g/kg），该区域土壤有机质状况良好，为农业生产提供了良好的基础肥力条件。建议继续保持适量有机肥投入，在低值区域可增施腐熟有机肥以进一步提升土壤质量。',
        },
        moisture: { 
          avg: 35.2, 
          min: 18.5,
          max: 52.7,
          std: 7.8,
          trend: 'stable', 
          status: 'good',
          description: '土壤含水量平均为35.2%，变异系数为22.1%，整体处于适宜水平。区域内含水量分布受地形和植被影响显著。东部山地森林区含水量最高，达到52.7%，良好的植被覆盖有效减少了水分蒸发。中部缓坡农田区含水量为30-40%，适宜大多数农作物生长需求。西北部河谷平地含水量相对较低，约为18.5-25%，主要受砂质土壤渗透性强的影响。监测时段正值冬季，含水量整体略低于年平均水平。根据当地气候特点和作物需求，建议在低含水量区域加强灌溉管理，在雨季注意排水防涝，保持土壤水分动态平衡。',
        },
        salinity: { 
          level: 'light', 
          area: '西北部河谷平原区域',
          coverage: '约12%（面积约3.2平方公里）',
          status: 'warning',
          description: '通过电导率和全盐量分析，发现西北部河谷平原区域存在轻度盐渍化现象，主要集中在低洼地带和排水不良区域，土壤全盐量在2-4 g/kg之间，属于轻度盐渍化水平。该区域地下水位较高（1.5-2.5米），加之地形低洼、排水不畅，导致盐分在土壤表层积累。盐渍化主要表现为硫酸盐型和氯化物型混合盐渍化，对作物生长有一定影响。东部和中部区域盐分含量正常（<1 g/kg），土壤质量良好。该问题若不加以控制，有进一步扩展的风险。建议在盐渍化区域实施排水工程改造，降低地下水位；增施有机肥料改善土壤结构；在生长季节进行适度淋洗；选择耐盐性较强的作物品种进行种植。',
        },
      },
      qualityScore: 76,
      qualityLevel: '良好',
      summary: '基于DZ01卫星2025年12月25日获取的高光谱遥感数据，结合AI智能分析模型，对湖南省张家界市监测区域（东经110.02°-110.62°，北纬28.97°-29.51°）进行土壤质量综合评估。监测面积约26.8平方公里，涵盖山地、丘陵和河谷平原等多种地貌类型。评估结果显示，该区域土壤质量综合指数为76分（满分100分），整体质量等级为"良好"。主要优势表现在有机质含量丰富（平均47.3 g/kg，高于全国平均水平60%）、土壤含水量适中（平均35.2%）、整体肥力状况良好。主要问题是西北部河谷平原区域存在轻度盐渍化现象，影响面积约3.2平方公里（占总面积12%），需要采取针对性改良措施。东部山地森林区和中部农田区土壤质量优良，为农林业生产提供了良好的基础条件。该区域整体适宜农业生产，建议加强分区管理，针对不同区域采取差异化的土壤改良和作物种植策略。',
      recommendations: [
        '【盐渍化治理】西北部轻度盐渍化区域（约3.2km²）应重点实施排水工程改造，建设排水渠系，降低地下水位至3米以下；在作物生长季节进行2-3次淋洗，每次灌水量200-300mm；增施腐熟有机肥（每亩3000-5000kg）和土壤改良剂（石膏粉每亩50-100kg），改善土壤结构，促进盐分淋洗下移',
        '【有机质维护】东部和中部优质区域应继续保持有机肥施用传统，建议每年每亩施用腐熟有机肥2000-3000kg；推广秸秆还田技术，提高土壤有机质循环利用；在有机质含量偏低的西北部区域，适当增加有机肥投入量至每亩4000kg以上，连续3-5年可显著提升土壤肥力',
        '【水分管理】建立土壤墒情监测网络，在东部山地布设3个监测点，中部农田布设5个监测点，西北部河谷布设4个监测点，实时监控土壤水分状况；雨季（4-6月）加强排水管理，特别是低洼地区要做好防涝措施；旱季（7-9月、11月-次年2月）根据作物需水规律及时补充灌溉，保持土壤含水量在25-40%的适宜范围',
        '【作物布局优化】在盐渍化风险区域，选择耐盐性较强的作物品种，如耐盐水稻（海稻86、盐丰47）、向日葵、甜菜等；东部山地森林区适宜发展生态林业和特色经济林（油茶、板栗等）；中部农田区可种植常规水稻、玉米、蔬菜等高产作物；建议实行3-5年轮作制度，合理搭配豆科作物，培肥地力',
        '【长期监测机制】建立"天-空-地"一体化土壤质量监测体系，每季度采用卫星遥感进行区域宏观监测，每月进行无人机巡查，关键区域每周进行地面采样监测；重点关注盐渍化区域的演变趋势、有机质动态变化和土壤含水量季节波动；建立土壤质量数据库和变化趋势分析模型，为精准施肥和科学种植提供数据支撑；每年生成年度土壤质量评估报告，指导农业生产决策',
        '【科技推广应用】推广精准农业技术，使用GPS定位和变量施肥设备，根据土壤质量空间差异实施精准管理；开展测土配方施肥，减少化肥用量20-30%；推广生物有机肥和微生物菌肥应用，改善土壤微生态环境；在盐渍化区域试验种植耐盐植物（如碱蓬、盐地碱蓬等）进行生物修复，逐步降低土壤盐分含量',
      ],
    }
  } else {
    // 时序分析报告（示例）
    return {
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
</style>
