<template>
  <div class="sidebar">
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :background-color="'transparent'"
      :text-color="'rgba(255, 255, 255, 0.7)'"
      :active-text-color="'#00ffcc'"
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
  background: linear-gradient(180deg, rgba(26, 26, 26, 0.95) 0%, rgba(15, 15, 15, 0.95) 100%);
  border-right: 1px solid $border-dark;

  .sidebar-menu {
    border-right: none;
    height: 100%;
    background-color: transparent;

    :deep(.el-menu-item) {
      color: rgba(255, 255, 255, 0.7);
      transition: $transition-glow;
      position: relative;
      margin: 4px 8px;
      border-radius: $border-radius-base;
      
      .el-icon {
        transition: filter 0.3s ease;
      }
      
      &:hover {
        background-color: rgba($neon-cyan, 0.05);
        color: $neon-cyan;
        
        .el-icon {
          filter: drop-shadow(0 0 4px currentColor);
        }
      }

      &.is-active {
        color: $neon-cyan !important;
        background-color: rgba($neon-cyan, 0.1);
        border-left: 4px solid $neon-cyan;
        box-shadow: inset -2px 0 10px rgba($neon-cyan, 0.3);
        padding-left: 16px; // 补偿左边框
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: $neon-cyan;
          box-shadow: 0 0 10px $neon-cyan, 0 0 20px $neon-cyan;
          border-radius: 0 2px 2px 0;
        }
        
        .el-icon {
          filter: drop-shadow(0 0 6px currentColor);
        }
      }
    }
  }
}
</style>
