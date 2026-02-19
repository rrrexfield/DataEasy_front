<template>
  <div class="navbar">
    <div class="navbar-left">
      <h1 class="app-title">
        <el-icon><Odometer /></el-icon>
        土壤质量智能监测平台
      </h1>
    </div>

    <div class="navbar-right">
      <el-space :size="20">
        <div class="status-item">
          <el-icon><FolderOpened /></el-icon>
          <span>数据状态: </span>
          <el-tag :type="(dataStatus.type as any)" size="small">{{ dataStatus.text }}</el-tag>
        </div>

        <div class="status-item">
          <el-icon><Connection /></el-icon>
          <span>AI 状态: </span>
          <el-tag :type="(aiStatus.type as any)" size="small">{{ aiStatus.text }}</el-tag>
        </div>

        <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
        <el-button :icon="QuestionFilled" circle @click="handleHelp" />
      </el-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Odometer,
  FolderOpened,
  Connection,
  Download,
  QuestionFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDataStore } from '@/stores'

const dataStore = useDataStore()

// 数据状态
const dataStatus = computed(() => {
  if (dataStore.isLoading) {
    return { type: 'warning', text: '加载中' }
  }
  return dataStore.hasData
    ? { type: 'success', text: '已就绪' }
    : { type: 'info', text: '无数据' }
})

// AI 状态
const aiStatus = ref({ type: 'success', text: '在线' })

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleHelp = () => {
  ElMessage.info('帮助文档开发中...')
}
</script>

<style scoped lang="scss">
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.navbar-left {
  .app-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: $text-primary-dark;
    @include text-glow($neon-cyan, low);
    transition: $transition-glow;

    .el-icon {
      font-size: 24px;
      color: $neon-cyan;
      filter: drop-shadow(0 0 8px rgba($neon-cyan, 0.8));
      animation: glow-pulse 2s ease-in-out infinite;
    }
    
    &:hover {
      @include text-glow($neon-cyan, medium);
      
      .el-icon {
        filter: drop-shadow(0 0 12px rgba($neon-cyan, 1));
      }
    }
  }
}

.navbar-right {
  .status-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    color: $text-regular-dark;

    .el-icon {
      color: $text-regular-dark;
    }
    
    // 覆盖标签为霓虹牌效果
    :deep(.el-tag) {
      background-color: transparent;
      border: 1px solid currentColor;
      
      &.el-tag--success {
        color: $success-color;
        border-color: $success-color;
        box-shadow: 0 0 5px rgba($success-color, 0.3);
      }
      
      &.el-tag--warning {
        color: $warning-color;
        border-color: $warning-color;
        box-shadow: 0 0 5px rgba($warning-color, 0.3);
      }
      
      &.el-tag--info {
        color: $info-color;
        border-color: $info-color;
        box-shadow: 0 0 5px rgba($info-color, 0.3);
      }
    }
  }
  
  // 按钮样式由 theme.scss 统一处理
}
</style>
