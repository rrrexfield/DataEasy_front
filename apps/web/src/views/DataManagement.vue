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
        <el-form-item label="行政区定位">
          <el-cascader
            v-model="queryForm.region"
            placeholder="选择行政区定位"
            clearable
            filterable
            :options="CHINA_REGIONS as any"
            :props="{ checkStrictly: true, expandTrigger: 'hover', value: 'value', label: 'label' }"
            style="width: 260px"
          />
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
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, Search, RefreshRight, View, Download, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CHINA_REGIONS } from '@/utils/map-utils'
import { useMapStore } from '@/stores'
import { useInversionData } from '@/composables/useDatabase'

const router = useRouter()
const mapStore = useMapStore()

// 使用数据库 Composable
const { dataList, deleteData } = useInversionData()

const queryForm = reactive({
  region: [] as string[],
  dateRange: [],
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const loading = ref(false)

// 使用计算属性从数据库加载数据
const tableData = computed(() => dataList.value)

// 监听数据变化，更新分页总数
watch(dataList, (newData) => {
  pagination.total = newData.length
}, { immediate: true })

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
  queryForm.region = []
  queryForm.dateRange = []
  handleQuery()
}

const handleView = (row: any) => {
  // 如果是遥感数据，跳转到首页并定位到遥感图像
  if (row.id === 'e4a7b9c2f6d1') {
    // 设置地图中心和缩放级别
    mapStore.setCenter([110.3, 29.2])
    mapStore.setZoom(11)
    // 跳转到首页，并显示原始RGB图像
    router.push({ path: '/home', query: { showRGB: 'true' } })
    ElMessage.success('正在定位到遥感影像区域...')
  } else {
    ElMessage.info(`查看数据: ${row.name}`)
  }
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
      deleteData(row.id)
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
