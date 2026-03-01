<template>
  <div class="login-container">
    <!-- 背景动画效果 -->
    <div class="background-effects">
      <div class="grid-lines"></div>
      <div class="light-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo 和标题 -->
      <div class="login-header">
        <div class="logo-wrapper">
          <el-icon :size="48" class="logo-icon">
            <Grid />
          </el-icon>
        </div>
        <h1 class="login-title">DataEasy</h1>
        <p class="login-subtitle">土壤质量智能监测平台</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            size="large"
            placeholder="用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            size="large"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <div class="form-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            <span v-if="!loading">登录</span>
            <span v-else>登录中...</span>
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部信息 -->
      <div class="login-footer">
        <p>还没有账号？ <el-link type="primary" :underline="false">立即注册</el-link></p>
      </div>
    </div>

    <!-- 版本信息 -->
    <div class="version-info">
      v1.0.0 © 2026 DataEasy Platform
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Grid } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const loginFormRef = ref<FormInstance>()
const loginForm = reactive({
  username: '',
  password: '',
})

const rememberMe = ref(false)
const loading = ref(false)

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const result = await authStore.login(loginForm.username, loginForm.password)
      
      if (result.success) {
        ElMessage.success(result.message)
        
        // 跳转到首页
        setTimeout(() => {
          router.push('/home')
        }, 500)
      } else {
        ElMessage.error(result.message)
      }
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}

// 开发模式下提供默认账号提示
if (import.meta.env.DEV) {
  console.log('开发模式提示：可使用任意用户名和密码登录（长度符合要求即可）')
}
</script>

<style scoped lang="scss">
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #1C1F22 0%, #25282B 50%, #1F2226 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景效果 */
.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba($neon-cyan, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba($neon-cyan, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

.light-orbs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 8s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, $neon-cyan, transparent);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, $neon-pink, transparent);
  bottom: 10%;
  right: 10%;
  animation-delay: 2s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, $neon-orange, transparent);
  top: 50%;
  left: 50%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(30px, -30px);
  }
  66% {
    transform: translate(-20px, 20px);
  }
}

/* 登录卡片 */
.login-card {
  position: relative;
  width: 420px;
  padding: 50px 40px;
  background: rgba(37, 40, 43, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba($neon-cyan, 0.3);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 60px rgba($neon-cyan, 0.2),
    inset 0 0 60px rgba($neon-cyan, 0.03);
  z-index: 1;
  animation: cardFloat 6s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, $neon-cyan, transparent);
    box-shadow: 0 0 10px rgba($neon-cyan, 0.5);
    border-radius: 16px 16px 0 0;
  }
}

@keyframes cardFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-wrapper {
  display: inline-block;
  margin-bottom: 20px;
}

.logo-icon {
  color: $neon-cyan;
  filter: drop-shadow(0 0 10px rgba($neon-cyan, 0.6));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    filter: drop-shadow(0 0 10px rgba($neon-cyan, 0.6));
  }
  50% {
    opacity: 0.8;
    filter: drop-shadow(0 0 20px rgba($neon-cyan, 0.8));
  }
}

.login-title {
  font-size: 32px;
  font-weight: 700;
  color: $text-primary-dark;
  margin: 10px 0;
  text-shadow: 0 0 20px rgba($neon-cyan, 0.4);
}

.login-subtitle {
  font-size: 14px;
  color: $text-secondary-dark;
  margin: 0;
}

/* 登录表单 */
.login-form {
  margin-top: 30px;

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }

  :deep(.el-input) {
    .el-input__wrapper {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba($neon-cyan, 0.2);
      box-shadow: none;
      transition: all 0.3s;

      &:hover {
        border-color: rgba($neon-cyan, 0.4);
      }

      &.is-focus {
        border-color: $neon-cyan;
        box-shadow: 0 0 10px rgba($neon-cyan, 0.3);
      }
    }

    .el-input__inner {
      color: $text-primary-dark;

      &::placeholder {
        color: $text-placeholder-dark;
      }
    }
  }
}

.form-options {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  :deep(.el-checkbox__label) {
    color: $text-regular-dark;
  }

  :deep(.el-link) {
    font-size: 14px;
  }
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, $neon-cyan, darken($neon-cyan, 10%));
  border: none;
  box-shadow: 0 4px 20px rgba($neon-cyan, 0.4);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba($neon-cyan, 0.6);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 登录底部 */
.login-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid $border-dark;

  p {
    margin: 0;
    font-size: 14px;
    color: $text-regular-dark;
  }

  :deep(.el-link) {
    font-size: 14px;
    font-weight: 600;
  }
}

/* 版本信息 */
.version-info {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: $text-secondary-dark;
  font-size: 12px;
  z-index: 1;
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    padding: 40px 30px;
  }

  .login-title {
    font-size: 28px;
  }
}
</style>
