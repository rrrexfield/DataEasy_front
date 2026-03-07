# 移动端避坑指南

## 1. OpenLayers 性能优化

### 问题
在移动端，地图图层过多会导致滑动卡顿。

### 解决方案

#### 方案 1: 限制图层数量
```typescript
// ❌ 不要同时开启过多图层
const layers = [
  rgbLayer,
  organicLayer,
  moistureLayer,
  ndviLayer,
  uncertaintyLayer,
  demLayer,
  // ... 更多图层
]

// ✅ 最多 2-3 个图层
const activeLayers = [rgbLayer, organicLayer]
```

#### 方案 2: 使用 Image 渲染模式
```typescript
import Map from 'ol/Map'
import ImageLayer from 'ol/layer/Image'
import Static from 'ol/source/ImageStatic'

const map = new Map({
  layers: [
    new ImageLayer({
      source: new Static({
        url: '/images/map.png',
        imageExtent: [west, south, east, north],
      }),
      // 强制使用 Image 渲染
      renderMode: 'image',
    }),
  ],
})
```

#### 方案 3: 降低像素比
```typescript
const map = new Map({
  target: mapContainer.value,
  pixelRatio: 1, // 降低到 1（默认是设备的 devicePixelRatio）
})
```

#### 方案 4: 延迟加载图层
```typescript
// 只在需要时加载图层
const loadLayer = (layerId: string) => {
  if (!layerCache[layerId]) {
    layerCache[layerId] = createLayer(layerId)
  }
  map.addLayer(layerCache[layerId])
}

// 切换图层时移除旧的
const switchLayer = (newLayerId: string) => {
  // 移除所有图层
  map.getLayers().forEach(layer => map.removeLayer(layer))
  // 添加新图层
  loadLayer(newLayerId)
}
```

## 2. 打包体积优化

### 问题
移动端对首屏加载敏感，需要优化打包体积。

### 解决方案

#### 已配置的 manualChunks
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vant': ['vant'],           // Vant UI 单独打包
          'openlayers': ['ol'],        // OpenLayers 单独打包
          'echarts': ['echarts'],      // ECharts 单独打包
        },
      },
    },
  },
})
```

#### 按需导入 ECharts
```typescript
// ❌ 不要全量导入
import * as echarts from 'echarts'

// ✅ 按需导入
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer])
```

#### 路由懒加载
```typescript
// ✅ 已配置懒加载
const router = createRouter({
  routes: [
    {
      path: '/home',
      component: () => import('@/views/Home.vue'), // 懒加载
    },
  ],
})
```

#### 图片优化
```bash
# 使用 WebP 格式
<img src="/images/map.webp" alt="地图" />

# 使用 sharp 压缩图片
pnpm add -D vite-plugin-imagemin
```

## 3. 触摸交互优化

### 问题 1: 300ms 点击延迟

#### 解决方案
```scss
// ✅ 已在全局样式中配置
* {
  touch-action: manipulation; // 禁用双击缩放，消除延迟
}
```

### 问题 2: 点击穿透

#### 解决方案
```typescript
// 使用 @touchstart 代替 @click
<div @touchstart.prevent="handleTouch">点击</div>

// 或使用 Vant 的 touch 事件
<div @touchstart="handleTouch" @touchend="handleTouchEnd">
```

### 问题 3: 误触

#### 解决方案
```scss
// 增加按钮尺寸
.btn {
  min-width: 44px;  // iOS 推荐最小尺寸
  min-height: 44px;
  padding: 12px;
}

// 增加点击区域（伪元素）
.btn::before {
  content: '';
  position: absolute;
  top: -10px;
  right: -10px;
  bottom: -10px;
  left: -10px;
}
```

## 4. 样式适配问题

### 问题 1: 安全区域适配（刘海屏）

#### 解决方案
```scss
// ✅ 已在全局样式中配置
body {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 问题 2: 键盘弹起遮挡输入框

#### 解决方案
```typescript
// capacitor.config.json 已配置
{
  "plugins": {
    "Keyboard": {
      "resize": "body" // 键盘弹起时调整 body 大小
    }
  }
}

// 或手动滚动到可见区域
const scrollToInput = (el: HTMLElement) => {
  setTimeout(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}
```

### 问题 3: viewport 单位计算错误

#### 解决方案
```scss
// 使用 postcss-px-to-viewport 的黑名单
.ignore {
  width: 100px; // 不会被转换
}

// 或使用 PX 大写（不会被转换）
.box {
  font-size: 16PX; // 不转换
  padding: 20px;   // 转换为 vw
}
```

## 5. Capacitor 常见问题

### 问题 1: 插件在浏览器中报错

#### 解决方案
```typescript
// ✅ 使用 try-catch 包裹
try {
  await StatusBar.setStyle({ style: Style.Dark })
} catch (error) {
  console.warn('StatusBar not available in browser')
}
```

### 问题 2: Android 打包后白屏

#### 解决方案
```json
// capacitor.config.json
{
  "server": {
    "androidScheme": "https" // ✅ 必须设置为 https
  }
}
```

### 问题 3: 图片路径问题

#### 解决方案
```typescript
// ❌ 不要使用相对路径
const imagePath = '../assets/image.png'

// ✅ 使用绝对路径或导入
import imageUrl from '@/assets/image.png'

// ✅ 使用 Capacitor API
const { webPath } = await Camera.getPhoto()
```

## 6. 性能监控

### 使用 Performance API
```typescript
// 监控首屏加载时间
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  console.log('首屏加载时间:', perfData.loadEventEnd - perfData.fetchStart, 'ms')
})

// 监控路由切换时间
router.beforeEach((to, from, next) => {
  performance.mark(`route-${to.path}-start`)
  next()
})

router.afterEach((to) => {
  performance.mark(`route-${to.path}-end`)
  performance.measure(
    `route-${to.path}`,
    `route-${to.path}-start`,
    `route-${to.path}-end`
  )
})
```

## 7. 调试技巧

### Chrome Remote Debugging (Android)
```bash
# 1. USB 连接手机，开启 USB 调试
# 2. Chrome 访问 chrome://inspect
# 3. 选择设备和 WebView
```

### Safari Web Inspector (iOS)
```bash
# 1. 在 iOS 设置 -> Safari -> 高级 -> 开启 Web 检查器
# 2. 连接 Mac 和 iPhone
# 3. Safari -> 开发 -> 选择设备
```

### vConsole (移动端调试工具)
```typescript
// 仅开发环境引入
if (import.meta.env.DEV) {
  import('vconsole').then(({ default: VConsole }) => {
    new VConsole()
  })
}
```

## 8. 测试清单

- [ ] 在不同屏幕尺寸测试（375px, 414px, 768px）
- [ ] 测试横屏和竖屏
- [ ] 测试弱网环境（Chrome DevTools 限速）
- [ ] 测试离线情况
- [ ] 测试键盘弹起和收起
- [ ] 测试刘海屏适配
- [ ] 测试触摸滑动性能
- [ ] 测试内存占用（Chrome DevTools Performance）
- [ ] 在真机上测试（不要只在模拟器）
