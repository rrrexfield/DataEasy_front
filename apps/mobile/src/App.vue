<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'

onMounted(async () => {
  // 设置状态栏样式
  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#000000' })
  } catch (error) {
    console.warn('StatusBar not available:', error)
  }

  // 监听返回按钮（仅 Android）
  App.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
      App.exitApp()
    } else {
      window.history.back()
    }
  })
})
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
