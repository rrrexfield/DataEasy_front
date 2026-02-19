<template>
  <div class="data-management-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>数据管理</span>
          <el-button type="primary" :icon="Upload" @click="handleUpload">上传数据</el-button>
        </div>
      </template>

      <!-- 查询表单 -->
      <el-form :model="queryForm" inline>
        <el-form-item label="研究区">
          <el-select v-model="queryForm.studyAreaId" placeholder="请选择研究区" style="width: 200px">
            <el-option label="研究区A" value="area-a" />
            <el-option label="研究区B" value="area-b" />
          </el-select>
        </el-form-item>

        <el-form-item label="日期范围">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="180" />
        <el-table-column prop="name" label="数据名称" />
        <el-table-column prop="studyArea" label="研究区" />
        <el-table-column prop="date" label="采集日期" width="120" />
        <el-table-column prop="type" label="数据类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link :icon="Download" @click="handleDownload(row)">下载</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handleQuery"
        @current-change="handleQuery"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Upload, Search, RefreshRight, View, Download, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const queryForm = reactive({
  studyAreaId: '',
  dateRange: [],
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const loading = ref(false)
const tableData = ref([
  {
    id: 'data-001',
    name: '高光谱影像数据_2024Q1',
    studyArea: '研究区A',
    date: '2024-03-15',
    type: '高光谱',
    size: '125MB',
  },
  {
    id: 'data-002',
    name: '地形数据_DEM',
    studyArea: '研究区A',
    date: '2024-03-10',
    type: '地形',
    size: '45MB',
  },
])

const getTypeColor = (type: string) => {
  const colorMap: Record<string, any> = {
    '高光谱': 'primary',
    '地形': 'success',
    '气象': 'warning',
  }
  return colorMap[type] || 'info'
}

const handleUpload = () => {
  ElMessage.info('上传功能开发中...')
}

const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleReset = () => {
  queryForm.studyAreaId = ''
  queryForm.dateRange = []
  handleQuery()
}

const handleView = (row: any) => {
  ElMessage.info(`查看数据: ${row.name}`)
}

const handleDownload = (row: any) => {
  ElMessage.info(`下载数据: ${row.name}`)
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除数据"${row.name}"吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('删除成功')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}
</script>

<style scoped lang="scss">
.data-management-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
