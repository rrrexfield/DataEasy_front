<template>
  <el-container class="main-layout">
    <el-header class="layout-header">
      <Navbar />
    </el-header>
    <el-container>
      <el-aside :width="sidebarWidth">
        <Sidebar />
      </el-aside>
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'

const sidebarWidth = ref('200px')
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
  width: 100%;
}

.layout-header {
  padding: 0;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  z-index: 1000;
}

.layout-main {
  padding: 20px;
  background-color: #f2f3f5;
  overflow: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
