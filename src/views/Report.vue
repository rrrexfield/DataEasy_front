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
            </div>

            <!-- 概述 -->
            <div class="report-section">
              <h2>一、概述</h2>
              <p>
                本报告基于高光谱遥感数据,利用AI智能分析技术,对研究区域的土壤质量进行综合评估。
                监测时间范围为{{ currentReport.startDate }}至{{ currentReport.endDate }},主要监测指标包括土壤有机质、含水量和盐渍化程度。
              </p>
            </div>

            <!-- 综合指数 -->
            <div class="report-section">
              <h2>二、土壤质量综合指数</h2>
              <div class="index-display">
                <div class="index-value">72</div>
                <div class="index-label">综合评分</div>
                <div class="index-desc">该区域整体土壤质量处于中等偏好水平</div>
              </div>
            </div>

            <!-- 指标分析 -->
            <div class="report-section">
              <h2>三、各项指标分析</h2>
              <div class="indicator-list">
                <div class="indicator-item">
                  <h3>3.1 有机质含量</h3>
                  <p>平均值: 45.8 g/kg,整体呈上升趋势,说明土壤肥力状况良好。</p>
                </div>
                <div class="indicator-item">
                  <h3>3.2 土壤含水量</h3>
                  <p>平均值: 32.5%,处于适中水平,有利于作物生长。</p>
                </div>
                <div class="indicator-item">
                  <h3>3.3 盐渍化程度</h3>
                  <p>西北部存在轻度盐渍化风险,建议加强监测和改良。</p>
                </div>
              </div>
            </div>

            <!-- AI分析结论 -->
            <div class="report-section">
              <h2>四、AI智能分析结论</h2>
              <div class="ai-conclusion">
                <p>
                  基于多模态数据融合分析,该区域整体土壤质量中等偏好,西北部存在轻度盐渍化风险。
                  建议采取以下措施:
                </p>
                <ol>
                  <li>加强西北部区域的排水改良工作</li>
                  <li>适当增施有机肥,提高土壤肥力</li>
                  <li>建立长期监测机制,跟踪土壤质量变化趋势</li>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Document, ZoomIn, ZoomOut, RefreshRight, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeReport = ref('report-001')
const scale = ref(1)
const exportFormat = ref('pdf')
const exportContent = ref(['charts', 'maps'])
const paperSize = ref('a4')

const reportList = ref([
  {
    id: 'report-001',
    name: '2024年Q1土壤质量分析报告',
    createTime: '2024-03-20',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
  },
  {
    id: 'report-002',
    name: '2023年度土壤质量年报',
    createTime: '2024-01-10',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
  },
])

const currentReport = ref(reportList.value[0])

const handleSelectReport = (id: string) => {
  const found = reportList.value.find(r => r.id === id)
  if (found) {
    currentReport.value = found
  }
}

const handleGenerate = () => {
  ElMessage.success('报告生成功能开发中...')
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
    font-size: 32px;
    text-align: center;
    margin-bottom: 20px;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 16px;
    border-bottom: 2px solid #409eff;
    padding-bottom: 8px;
  }

  h3 {
    font-size: 18px;
    margin: 16px 0 8px;
  }

  p {
    line-height: 1.8;
    color: #606266;
    text-indent: 2em;
  }

  &.cover {
    text-align: center;
    padding: 100px 0;

    h1 {
      font-size: 36px;
      margin-bottom: 30px;
    }

    .subtitle {
      font-size: 20px;
      color: #909399;
      margin-bottom: 10px;
    }

    .date {
      font-size: 14px;
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
    font-size: 72px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .index-label {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .index-desc {
    font-size: 16px;
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
      color: #606266;
    }
  }
}

.export-card {
  height: 100%;
}
</style>
