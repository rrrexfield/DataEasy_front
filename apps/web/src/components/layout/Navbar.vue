<template>
  <div class="navbar">
    <div class="navbar-left">
      <div class="title-container">
        <h1 class="app-title">
          <img src="/Dataeasy.png" alt="DataEasy Logo" class="app-logo">
          土壤质量智能监测平台
        </h1>
        <div class="project-subtitle">
          中国地质大学(武汉)华为“智能基座”重点合作项目
        </div>
      </div>
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
        
        <!-- 用户下拉菜单 -->
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="32" :icon="UserFilled" />
            <span class="username">{{ authStore.userInfo?.username || '用户' }}</span>
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="User" disabled>
                {{ authStore.userInfo?.email || '未设置邮箱' }}
              </el-dropdown-item>
              <el-dropdown-item divided :icon="Setting" command="settings">
                个人设置
              </el-dropdown-item>
              <el-dropdown-item :icon="SwitchButton" command="logout">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  FolderOpened,
  Connection,
  Download,
  QuestionFilled,
  UserFilled,
  ArrowDown,
  User,
  Setting,
  SwitchButton,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDataStore, useAuthStore } from '@/stores'

const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()

// 数据状态
const dataStatus = computed(() => {
  if (dataStore.isLoading) {
    return { type: 'warning', text: '加载中' }
  }
  // 默认显示云端数据状态
  return { type: 'success', text: '云端数据' }
})

// AI 状态
const aiStatus = ref({ type: 'success', text: '在线' })

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleHelp = () => {
  ElMessage.info('帮助文档开发中...')
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      authStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    }).catch(() => {
      // 取消操作
    })
  } else if (command === 'settings') {
    ElMessage.info('个人设置功能开发中...')
  }
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
  .title-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .app-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.2;
    color: $text-primary-dark;
    @include text-glow($neon-cyan, low);

    .app-logo {
      height: 42px;
      width: auto;
      object-fit: contain;
    }
  }

  .project-subtitle {
    margin-left: 52px; // 与标题对齐（logo宽度 + gap）
    font-size: 12px;
    font-weight: 400;
    line-height: 1.2;
    color: $text-primary-dark;
    letter-spacing: 0.3px;
    @include text-glow($neon-orange, low);
  }
}

.navbar-right {
  .status-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 18px;
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

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px 4px 4px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba($neon-cyan, 0.2);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba($neon-cyan, 0.4);
      box-shadow: 0 0 10px rgba($neon-cyan, 0.2);
    }

    .username {
      font-size: 14px;
      color: $text-primary-dark;
      font-weight: 500;
    }

    .el-icon--right {
      font-size: 12px;
      color: $text-secondary-dark;
    }
  }
  
  // 按钮样式由 theme.scss 统一处理
}
</style>
