<template>
  <nav class="app-tabbar" aria-label="主导航">
    <button
      type="button"
      class="tab-item"
      :class="{ 'is-active': isActive('/data') }"
      @click="handleGo('/data')"
    >
      <van-icon name="orders-o" />
      <span>数据</span>
    </button>

    <button
      type="button"
      class="tab-item"
      :class="{ 'is-active': isActive('/inversion') }"
      @click="handleGo('/inversion')"
    >
      <van-icon name="search" />
      <span>反演</span>
    </button>

    <button
      type="button"
      class="tab-item tab-item--home"
      :class="{ 'is-active': isActive('/home') }"
      @click="handleGo('/home')"
    >
      <span class="home-bubble">
        <van-icon name="home-o" />
      </span>
      <span class="home-label">首页</span>
    </button>

    <button
      type="button"
      class="tab-item"
      :class="{ 'is-active': isActive('/report') }"
      @click="handleGo('/report')"
    >
      <van-icon name="description" />
      <span>报告</span>
    </button>

    <button
      type="button"
      class="tab-item"
      :class="{ 'is-active': isActive('/profile') }"
      @click="handleGo('/profile')"
    >
      <van-icon name="user-o" />
      <span>我的</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const isActive = (path: string) => route.path === path

const handleGo = (path: string) => {
  if (route.path !== path) {
    router.push(path)
  }
}
</script>

<style scoped lang="scss">
.app-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1200;
  height: calc(62px + env(safe-area-inset-bottom));
  padding: 4px 8px calc(4px + env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: end;
  background: #000;
  border-radius: 0;
  overflow: visible;
  box-shadow: 0 -10px 24px rgba(0, 0, 0, 0.45);

  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: -18px;
    height: 18px;
    background: rgba(0, 0, 0, 0.02);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
    -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: -18px;
    height: 18px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
    pointer-events: none;
    z-index: 0;
  }
}

.tab-item {
  position: relative;
  z-index: 1;
  border: none;
  background: transparent;
  color: #5a5f67;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 11px;
  line-height: 1.2;
  padding: 0;
  min-height: 42px;

  &:not(.tab-item--home) {
    transform: translateY(-12px);
  }

  .van-icon {
    font-size: 19px;
    opacity: 0.75;
  }

  span {
    opacity: 0.78;
  }

  &.is-active {
    color: #00ffcc;

    .van-icon,
    span {
      opacity: 1;
      text-shadow: 0 0 8px rgba(0, 255, 204, 0.35);
    }
  }
}

.tab-item--home {
  transform: translateY(-6px);

  .home-bubble {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    border: 4px solid rgba(211, 255, 239, 0.6);
    background: linear-gradient(160deg, #19dca8 10%, #0b8f69 90%);
    box-shadow: 0 6px 14px rgba(0, 201, 138, 0.28);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    .van-icon {
      font-size: 26px;
      color: rgba(255, 255, 255, 0.86);
      opacity: 1;
    }
  }

  .home-label {
    margin-top: 5px;
    color: #6f7a86;
    font-weight: 600;
    opacity: 0.9;
  }

  &.is-active .home-bubble {
    border-color: rgba(229, 255, 246, 0.95);
    background: linear-gradient(160deg, #31f7bd 10%, #00c98a 90%);
    box-shadow:
      0 0 0 2px rgba(229, 255, 246, 0.26),
      0 12px 26px rgba(0, 255, 170, 0.42);

    .van-icon {
      color: #0a2a20;
      text-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
    }
  }

  &.is-active .home-label {
    color: #00ffcc;
    opacity: 1;
  }
}
</style>
