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
          <transition name="glow-fade" mode="out-in">
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
  background-color: $bg-primary;
}

.layout-header {
  padding: 0;
  height: $navbar-height;
  background-color: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px);
  box-shadow: none;
  border-bottom: 1px solid rgba($neon-cyan, 0.3);
  z-index: $z-index-navbar;
  position: relative;
  
  // 底部发光线
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, $neon-cyan, transparent);
    box-shadow: 0 0 10px rgba($neon-cyan, 0.5);
  }
}

.layout-main {
  padding: 20px;
  background-color: $bg-primary;
  overflow: auto;
}
</style>
