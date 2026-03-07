<template>
  <div class="login-page">
    <!-- 背景光效 -->
    <div class="bg-effects">
      <div class="grid-lines"></div>
      <div class="light-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-container">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-icon neon-border">
          <van-icon name="apps-o" size="40" />
        </div>
        <h1 class="app-title neon-text">DataEasy</h1>
        <p class="app-subtitle">土壤质量智能监测平台</p>
      </div>

      <!-- 登录表单 -->
      <van-form @submit="handleLogin">
        <van-cell-group inset>
          <van-field
            v-model="username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }, { validator: (val: string) => val.length >= 3, message: '用户名长度至少3个字符' }]"
          >
            <template #left-icon>
              <van-icon name="user-o" />
            </template>
          </van-field>

          <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }, { validator: (val: string) => val.length >= 6, message: '密码长度至少6个字符' }]"
          >
            <template #left-icon>
              <van-icon name="lock" />
            </template>
          </van-field>
        </van-cell-group>

        <div class="form-footer">
          <van-checkbox v-model="rememberMe">记住我</van-checkbox>
          <span class="forgot-link">忘记密码？</span>
        </div>

        <div class="button-group">
          <van-button
            type="primary"
            native-type="submit"
            block
            :loading="loading"
            loading-text="登录中..."
            class="login-button neon-border"
          >
            登录
          </van-button>
        </div>
      </van-form>

      <!-- 版本信息 -->
      <div class="version-info">
        v1.0.0 © 2026 DataEasy Platform
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  
  try {
    const result = await authStore.login(username.value, password.value)
    
    if (result.success) {
      showToast({
        message: result.message,
        type: 'success',
      })
      
      setTimeout(() => {
        router.push('/home')
      }, 500)
    } else {
      showToast({
        message: result.message,
        type: 'fail',
      })
    }
  } catch (error: any) {
    showToast({
      message: error.message || '登录失败',
      type: 'fail',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.login-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: $bg-primary;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 背景光效
.bg-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

// 网格线
.grid-lines {
  position: absolute;
  width: 200%;
  height: 200%;
  background-image:
    linear-gradient(rgba($primary-color, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba($primary-color, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

// 光球
.light-orbs {
  position: absolute;
  width: 100%;
  height: 100%;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.3;
  animation: float-up 15s ease-in-out infinite;
}

.orb-1 {
  width: 200px;
  height: 200px;
  background: $neon-cyan;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.orb-2 {
  width: 150px;
  height: 150px;
  background: $neon-purple;
  top: 60%;
  right: 10%;
  animation-delay: 5s;
}

.orb-3 {
  width: 180px;
  height: 180px;
  background: $neon-pink;
  bottom: 10%;
  left: 20%;
  animation-delay: 10s;
}

@keyframes float-up {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}

// 登录容器
.login-container {
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 400px;
  padding: 32px 24px;
  background: rgba($bg-secondary, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  box-shadow: $shadow-dark;
}

// Logo区域
.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
}

.app-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px;
}

.app-subtitle {
  font-size: 12px;
  color: $text-secondary;
  margin: 0;
}

// 表单
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 16px 24px;
}

.forgot-link {
  font-size: 12px;
  color: $primary-color;
}

.button-group {
  padding: 0 16px;
}

.login-button {
  height: 48px;
  font-size: 14px;
  font-weight: 600;
  
  &:active {
    box-shadow:
      0 0 10px $primary-color,
      0 0 20px $primary-color;
  }
}

// 版本信息
.version-info {
  margin-top: 24px;
  text-align: center;
  font-size: 11px;
  color: $text-disabled;
}

// Vant组件样式覆盖
:deep(.van-cell-group) {
  background:rgba($bg-elevated, 0.6);
  margin-bottom: 0;
}

:deep(.van-cell) {
  background: transparent;
  color: $text-primary;
  
  &::after {
    border-color: $border-color;
  }
}

:deep(.van-field__label) {
  color: $text-secondary;
  font-size: 13px;
}

:deep(.van-field__control) {
  color: $text-primary;
  font-size: 13px;
}

:deep(.van-icon) {
  color: $text-secondary;
}

:deep(.van-checkbox__label) {
  color: $text-primary;
  font-size: 12px;
}

:deep(.van-checkbox__icon .van-icon) {
  background: transparent;
  border-color: rgba(0, 255, 204, 0.45);
}

:deep(.van-checkbox__icon--checked .van-icon) {
  color: #10201c !important;
  background: #00ffcc !important;
  border-color: #00ffcc !important;
  box-shadow: 0 0 8px rgba(0, 255, 204, 0.35);
}
</style>
· MOH