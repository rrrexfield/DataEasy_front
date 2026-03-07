# DataEasy Mobile - 开发指南

## 项目结构

```
apps/mobile/
├── src/
│   ├── views/          # 页面组件
│   │   ├── Home.vue    # 首页（地图）
│   │   ├── Data.vue    # 数据管理
│   │   ├── Analysis.vue # 指标反演
│   │   └── Profile.vue  # 个人中心
│   ├── utils/          # 工具函数
│   │   ├── map-utils.ts      # 地图工具（优化版）
│   │   └── capacitor.ts      # Capacitor 原生能力
│   ├── styles/         # 样式文件
│   ├── router/         # 路由配置
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── capacitor.config.json  # Capacitor 配置
├── vite.config.ts      # Vite 配置（含 px2vw）
└── package.json
```

## 核心技术

### 1. UI 组件库：Vant
- 轻量级移动端组件库
- 支持按需引入
- 自动导入配置

```typescript
// 自动导入，无需手动 import
<van-button type="primary">按钮</van-button>
```

### 2. 响应式适配：postcss-px-to-viewport
自动将 px 转换为 vw，基于 375px 设计稿：

```scss
// 写 px
.box {
  width: 375px;  // 编译为 100vw
  padding: 20px; // 编译为 5.33vw
}

// 不需要转换的使用 .ignore 类名
.ignore {
  font-size: 16px; // 保持 16px
}
```

### 3. Capacitor 原生能力

#### 相机
```typescript
import { takePicture } from '@/utils/capacitor'

const imagePath = await takePicture()
```

#### 定位
```typescript
import { getCurrentPosition } from '@/utils/capacitor'

const { lat, lon } = await getCurrentPosition()
```

#### 触觉反馈
```typescript
import { vibrate } from '@/utils/capacitor'
import { ImpactStyle } from '@capacitor/haptics'

await vibrate(ImpactStyle.Light)
```

### 4. 地图性能优化

移动端地图优化：
```typescript
// 降低像素比
pixelRatio: 1

// 限制缩放级别
maxZoom: 18
minZoom: 3

// 禁用双击缩放（避免误触）
```

建议：
- 图层不超过 3 个
- 使用 `renderMode: 'image'`（如需要）
- 及时销毁不需要的图层

## 开发命令

```bash
# 开发模式（Web 预览）
pnpm dev

# 构建
pnpm build

# 初始化 Capacitor（首次运行）
pnpm cap:init

# 添加 Android 平台
pnpm cap:add:android

# 添加 iOS 平台
pnpm cap:add:ios

# 同步代码到原生平台
pnpm cap:sync

# 打开 Android Studio
pnpm cap:open:android

# 打开 Xcode
pnpm cap:open:ios

# 一键构建并打开 Android
pnpm android

# 一键构建并打开 iOS
pnpm ios
```

## 调试技巧

### 1. 浏览器调试
```bash
pnpm dev
# 在浏览器中访问 http://localhost:5174
# 使用 Chrome DevTools 的移动设备模拟器
```

### 2. 真机调试

**Android:**
```bash
# USB 连接手机，启用 USB 调试
pnpm build
pnpm cap:sync
pnpm cap:open:android

# 在 Android Studio 中点击 Run
# Chrome 打开 chrome://inspect 查看 WebView
```

**iOS:**
```bash
# 连接 Mac 和 iPhone
pnpm build
pnpm cap:sync
pnpm cap:open:ios

# 在 Xcode 中选择设备并 Run
# Safari -> 开发 -> 选择设备 -> 检查器
```

## 性能优化建议

### 1. 代码分割
已配置手动分块：
- `vant` - Vant UI 组件库
- `openlayers` - 地图库
- `echarts` - 图表库

### 2. 图片优化
- 使用 WebP 格式
- 压缩图片（TinyPNG）
- 懒加载：`<img loading="lazy" />`

### 3. 网络优化
- 添加 Service Worker
- 配置 HTTP 缓存
- 使用 CDN

### 4. 动画优化
- 使用 CSS `transform` 和 `opacity`
- 避免 Layout 和 Paint
- 使用 `will-change` 提示浏览器

```scss
.animate {
  will-change: transform;
  transform: translateX(100px);
  transition: transform 0.3s;
}
```

## 常见问题

### Q1: 地图在移动端卡顿？
**A:** 减少图层数量，使用 `pixelRatio: 1`，考虑使用静态地图截图。

### Q2: Vant 组件样式被覆盖？
**A:** 检查是否有全局样式影响，使用 `:deep()` 修改组件样式：
```scss
:deep(.van-button) {
  color: red;
}
```

### Q3: Capacitor 插件在浏览器中报错？
**A:** 使用 try-catch 包裹，Capacitor API 在浏览器中不可用：
```typescript
try {
  await StatusBar.setStyle({ style: Style.Dark })
} catch (error) {
  console.warn('StatusBar not available in browser')
}
```

### Q4: 安卓打包后白屏？
**A:** 检查 `capacitor.config.json` 中的 `androidScheme` 设置为 `https`。

## 下一步开发

- [ ] 实现数据上传（使用相机拍照）
- [ ] 离线数据缓存
- [ ] 推送通知
- [ ] 分享功能
- [ ] 深色模式适配
- [ ] 多语言支持

## 参考资料

- [Vant 官方文档](https://vant-ui.github.io/vant/)
- [Capacitor 官方文档](https://capacitorjs.com/)
- [OpenLayers 文档](https://openlayers.org/)
