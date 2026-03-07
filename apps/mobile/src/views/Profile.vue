<template>
  <div class="profile-page">
    <van-nav-bar
      title="我的"
      fixed
      placeholder
    />

    <div class="profile-content">
      <div class="user-card">
        <div class="avatar">DE</div>
        <div class="user-meta">
          <div class="username">{{ displayName }}</div>
          <div class="user-sub">DataEasy 土壤质量智能监测平台</div>
        </div>
      </div>

      <van-cell-group inset class="profile-group">
        <template #title>
          <span class="group-title">个人信息</span>
        </template>
        <van-cell
          title="用户名"
          :value="displayName"
        />
        <van-cell
          title="账号状态"
          value="已登录"
        />
        <van-cell
          title="当前 Token"
          :value="tokenText"
        />
      </van-cell-group>

      <van-cell-group inset class="profile-group">
        <template #title>
          <span class="group-title">登录设置</span>
        </template>
        <van-cell title="记住我">
          <template #value>
            <van-switch v-model="rememberMe" size="22" />
          </template>
        </van-cell>
        <van-cell title="自动登录">
          <template #value>
            <van-switch v-model="autoLogin" size="22" />
          </template>
        </van-cell>
        <van-cell
          title="修改密码"
          is-link
          @click="showToast('功能开发中')"
        />
        <van-cell
          title="忘记密码"
          is-link
          @click="showToast('请联系管理员重置密码')"
        />
      </van-cell-group>

      <van-cell-group inset class="profile-group">
        <template #title>
          <span class="group-title">其他</span>
        </template>
        <van-cell
          title="关于 DataEasy"
          value="v1.0.0"
          is-link
          @click="showToast('DataEasy v1.0.0')"
        />
      </van-cell-group>

      <div class="logout-btn">
        <van-button
          type="danger"
          block
          @click="handleLogout"
        >
          退出登录
        </van-button>
      </div>
    </div>

    <AppTabbar />
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const displayName = computed(() => authStore.username || 'DataEasy User')
const tokenText = computed(() => {
  if (!authStore.token) return '未启用'
  return `${authStore.token.slice(0, 12)}...`
})

const rememberMe = ref(localStorage.getItem('rememberMe') === '1')
const autoLogin = ref(localStorage.getItem('autoLogin') === '1')

watch(rememberMe, (value) => {
  localStorage.setItem('rememberMe', value ? '1' : '0')
})

watch(autoLogin, (value) => {
  localStorage.setItem('autoLogin', value ? '1' : '0')
})

const handleLogout = () => {
  authStore.logout()
  router.replace('/login')
}
</script>

<style scoped lang="scss">
.profile-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-primary;
}

.profile-content {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px calc(96px + env(safe-area-inset-bottom));
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $bg-secondary;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(140deg, #16c7ff 0%, #0d8ed6 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-meta {
  min-width: 0;
}

.username {
  color: $text-primary;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}

.user-sub {
  margin-top: 4px;
  color: #aab0b7;
  font-size: 12px;
  line-height: 1.4;
}

.profile-group {
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;

  :deep(.van-cell-group__title) {
    margin: 0;
    padding: 0 2px 6px;
  }

  :deep(.van-cell) {
    padding: 11px 12px;
  }
}

.group-title {
  color: $text-primary;
  font-size: 13px;
  font-weight: 700;
}

.logout-btn {
  margin-top: 4px;
  margin-bottom: 6px;
}
</style>
