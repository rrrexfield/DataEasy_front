<template>
  <div class="sidebar">
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      router
    >
      <el-menu-item index="/home">
        <el-icon><Odometer /></el-icon>
        <span>首页总览</span>
      </el-menu-item>

      <el-menu-item index="/data">
        <el-icon><Document /></el-icon>
        <span>数据管理</span>
      </el-menu-item>

      <el-menu-item index="/inversion">
        <el-icon><DataAnalysis /></el-icon>
        <span>指标反演</span>
      </el-menu-item>

      <el-menu-item index="/time-series">
        <el-icon><TrendCharts /></el-icon>
        <span>时序分析</span>
      </el-menu-item>

      <el-menu-item index="/report">
        <el-icon><Tickets /></el-icon>
        <span>成果报告</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Odometer,
  Document,
  DataAnalysis,
  TrendCharts,
  Tickets,
} from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.sidebar {
  height: 100%;
  background-color: #304156;

  .sidebar-menu {
    border-right: none;
    height: 100%;

    :deep(.el-menu-item) {
      &:hover {
        background-color: rgba(64, 158, 255, 0.1);
      }

      &.is-active {
        background-color: rgba(64, 158, 255, 0.2);
      }
    }
  }
}
</style>
