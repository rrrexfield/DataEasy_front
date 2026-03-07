# DataEasy - 土壤质量智能监测平台

> 基于高光谱遥感的 AI 土壤指标反演系统

## 项目简介

DataEasy 是一个专业的土壤质量智能监测平台，利用卫星高光谱遥感数据和 AI 深度学习技术，实现土壤质量指标的智能反演与分析。系统提供从数据管理、AI反演分析、时序监测到成果报告的全流程解决方案，支持土壤有机碳、含水量、盐渍化等多项指标的空间分布监测与智能解读。

### 主要特色

- 🛰️ **高光谱遥感分析**：支持 DZ01V 等卫星的 L2 级高光谱数据
- 🤖 **AI 智能反演**：集成随机森林、SVM、深度学习等多种算法模型
- 📊 **可视化分析**：基于 OpenLayers 的交互式地图和 ECharts 图表
- 🔍 **不确定性量化**：提供模型预测可信度评估和风险区域识别
- 📈 **时序监测**：支持多期影像对比和变化趋势分析
- 📄 **智能报告**：一键生成包含详细分析和建议的专业报告

## 技术栈

### 核心框架
- **前端框架**: Vue 3.4 (Composition API + `<script setup>`)
- **开发语言**: TypeScript 5.3
- **构建工具**: Vite 5.0
- **包管理器**: pnpm 9.14.2

### UI 与可视化
- **组件库**: Element Plus 2.5
- **图标库**: @element-plus/icons-vue 2.3
- **地图引擎**: OpenLayers 8.2
- **图表库**: Apache ECharts 5.4

### 状态与路由
- **状态管理**: Pinia 2.1
- **路由管理**: Vue Router 4.2

### 工具库
- **HTTP 客户端**: Axios 1.6
- **日期处理**: Day.js 1.11
- **样式预处理**: SCSS/Sass 1.70

### 开发工具
- **代码规范**: ESLint 8.56 + Prettier 3.2
- **类型检查**: vue-tsc 1.8
- **自动导入**: unplugin-auto-import + unplugin-vue-components

## 核心功能

### 1. 登录认证
- 用户身份验证
- 路由守卫机制
- 会话状态管理

### 2. 首页总览
- **多图层地图展示**
  - 原始高光谱 RGB 影像
  - 土壤有机质反演结果
  - 土壤含水量反演结果
  - 植被覆盖度（NDVI）
  - 预测不确定性热力图
  - 地形高程（DEM）
- **交互式图层管理**
  - 图层可见性切换
  - 透明度动态调节（0-100%）
  - 全部开启/关闭快捷操作
- **智能分析结果**
  - 土壤质量综合指数仪表盘（5个子指标）
  - AI 自然语言解读
  - 模型可信度可视化
  - 风险区域自动标注
  - 结果归因分析（因素贡献度）
  - 复核建议与决策支持
- **地图交互**
  - 行政区快速定位（省-市-区三级联动）
  - 放大/缩小/刷新控制
  - 告警点悬停提示
  - 高风险区域标注

### 3. 数据管理
- **数据上传**：支持高光谱遥感数据批量上传
- **多维度查询**
  - 按行政区域筛选（三级级联）
  - 按日期范围查询
  - 按数据类型过滤
- **数据操作**
  - 查看：自动跳转首页并定位到影像区域
  - 下载：导出原始数据文件
  - 删除：批量删除数据（带确认）
- **数据展示**
  - 分页表格（10/20/50/100 条/页）
  - 数据类型标签（高光谱/地形/气象）
  - 文件信息详情

### 4. 指标反演
- **参数配置**
  - 5 种指标类型：土壤有机碳（OC）、全氮（TN）、全磷（TP）、含水量、NDVI
  - 3 种算法模型：随机森林、支持向量机、深度学习
  - 研究区域选择（省-市-区）
  - 数据源选择
- **反演执行**
  - 实时进度显示
  - AI 模型自动调用
  - 反演状态追踪
- **结果展示**
  - 空间分布地图（分级色斑/连续渲染）
  - 统计信息面板（均值、中位数、最大值、最小值、标准差、变异系数）
  - 等级占比柱状图（5个等级）
  - 地图缩放与平移

### 5. 时序分析
- **时间轴控制**
  - 拖动滑块选择时间点
  - 播放/暂停动画（2秒/帧）
  - 重置到起始时间
  - 时间标记点
- **地图对比视图**
  - 双地图并排对比
  - 当前时间 vs 对比时间
  - 同步视图控制
- **趋势图表**
  - 多指标折线图
  - 时间序列变化分析
  - 异常点识别
- **指标选择**
  - 有机质
  - 含水量
  - 盐渍化

### 6. 成果报告
- **报告生成**
  - 单图分析报告（基于单期遥感数据）
    - 详细数据源信息（产品ID、卫星、传感器、影像范围）
    - 深度空间分布分析
    - 针对性改良建议（6大类措施）
  - 时序分析报告（基于多期数据）
    - 时间序列变化
    - 趋势预测
- **报告内容**
  - 封面与概述
  - 土壤质量综合指数
  - 各项指标详细分析（有机质、含水量、盐渍化）
  - AI 智能分析结论与建议
- **报告管理**
  - 报告目录浏览
  - 实时预览
  - 缩放控制（50%-200%）
- **导出功能**
  - 多格式支持：PDF、Word、图片
  - 自定义内容：图表、地图、原始数据
  - 纸张规格：A4、A3、Letter

## 项目结构

```
DataEasy_front/
├── public/                      # 静态资源
│   └── demo_bundle/            # 演示数据包
│       ├── raw/                # 原始RGB影像
│       ├── processed/          # 处理后影像（NDVI、DEM等）
│       ├── results/            # 预测结果GeoTIFF
│       └── DZ01V_*_MTL.txt    # 元数据文件
├── src/
│   ├── views/                  # 页面组件
│   │   ├── Login.vue          # 登录页
│   │   ├── Home.vue           # 首页总览（1975行，核心视图）
│   │   ├── DataManagement.vue # 数据管理
│   │   ├── Inversion.vue      # 指标反演（489行）
│   │   ├── TimeSeries.vue     # 时序分析
│   │   └── Report.vue         # 成果报告（781行）
│   ├── components/
│   │   └── layout/            # 布局组件
│   │       ├── MainLayout.vue # 主布局（左侧边栏+顶部导航）
│   │       ├── Navbar.vue     # 顶部导航栏
│   │       └── Sidebar.vue    # 侧边栏菜单
│   ├── stores/                # Pinia 状态管理
│   │   ├── index.ts          # Store 统一导出
│   │   ├── auth.ts           # 认证状态
│   │   ├── map.ts            # 地图状态（中心点、缩放、图层）
│   │   ├── data.ts           # 数据状态（反演数据、指标）
│   │   └── ai.ts             # AI 分析状态（结果、可信度）
│   ├── router/
│   │   └── index.ts          # 路由配置（5个页面+认证守卫）
│   ├── services/             # API 服务层
│   │   ├── api.ts            # Axios 实例配置
│   │   └── modules/          # 模块化 API
│   │       ├── data.ts       # 数据管理 API
│   │       ├── analysis.ts   # 反演分析 API
│   │       └── report.ts     # 报告生成 API
│   ├── utils/                # 工具函数
│   │   ├── map-utils.ts      # 地图工具（创建地图、图层管理、定位等）
│   │   ├── chart-config.ts   # ECharts 配置（仪表盘、柱状图、折线图）
│   │   └── metadata-parser.ts # MTL 元数据解析器
│   ├── types/                # TypeScript 类型定义
│   │   ├── index.ts          # 通用类型
│   │   └── api.ts            # API 响应类型
│   ├── styles/               # 全局样式
│   │   ├── variables.scss    # SCSS 变量（颜色、尺寸等）
│   │   ├── mixins.scss       # SCSS 混入
│   │   ├── global.scss       # 全局样式
│   │   ├── theme.scss        # 主题样式
│   │   ├── animations.scss   # 动画效果
│   │   └── light-effects.scss # 光效样式
│   ├── App.vue               # 根组件
│   ├── main.ts               # 应用入口
│   ├── vite-env.d.ts         # Vite 类型声明
│   ├── auto-imports.d.ts     # 自动导入类型（自动生成）
│   └── components.d.ts       # 组件类型（自动生成）
├── .vscode/                  # VS Code 配置
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
├── tsconfig.node.json        # Node TypeScript 配置
├── package.json              # 项目依赖
├── pnpm-lock.yaml            # pnpm 锁定文件
└── README.md                 # 项目文档
```

## 快速开始

### 环境要求

- **Node.js**: >= 18.0
- **pnpm**: >= 8.0 (推荐 9.14.2+)
- **浏览器**: Chrome/Edge >= 90, Firefox >= 88, Safari >= 14

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 开发运行

```bash
pnpm dev
```

浏览器自动打开 http://localhost:5173

### 构建生产版本

```bash
# 类型检查 + 构建
pnpm build

# 仅构建（跳过类型检查）
vite build
```

构建产物输出到 `dist/` 目录。

### 预览构建结果

```bash
pnpm preview
```

### 代码质量

```bash
# 运行 ESLint 检查并自动修复
pnpm lint

# 运行 Prettier 格式化
pnpm format

# TypeScript 类型检查
vue-tsc --noEmit
```

## 配置说明

### 环境变量

项目支持多环境配置，通过 `.env` 文件管理：

```bash
.env                # 所有环境共享
.env.development    # 开发环境
.env.production     # 生产环境
```

**主要配置项**：

```env
# 应用配置
VITE_APP_TITLE=DataEasy         # 应用标题

# API 配置
VITE_API_BASE_URL=http://localhost:3000/api  # API 基础地址

# 地图配置
VITE_MAP_CENTER=110.3,29.2      # 地图初始中心点（经度,纬度）
VITE_MAP_ZOOM=10                # 地图初始缩放级别
```

### Vite 配置

`vite.config.ts` 核心配置：

- **路径别名**：`@` → `src/`
- **自动导入**：Vue API、Element Plus 组件
- **SCSS 预处理**：全局注入 variables 和 mixins
- **开发服务器**：端口 5173，自动打开浏览器

## 开发指南

### 自动导入机制

项目配置了 `unplugin-auto-import` 和 `unplugin-vue-components`，无需手动导入：

**Vue API 自动导入**：
```typescript
// ❌ 不需要
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMapStore } from '@/stores'

// ✅ 直接使用
const count = ref(0)
const router = useRouter()
const mapStore = useMapStore()
```

**Element Plus 组件自动导入**：
```vue
<!-- ❌ 不需要 -->
<script setup>
import { ElButton, ElCard } from 'element-plus'
</script>

<!-- ✅ 直接使用 -->
<template>
  <el-button type="primary">按钮</el-button>
  <el-card>卡片</el-card>
</template>
```

### 路径别名

使用 `@` 作为 `src` 目录的别名：

```typescript
// 导入组件
import MainLayout from '@/components/layout/MainLayout.vue'

// 导入 Store
import { useMapStore, useDataStore } from '@/stores'

// 导入类型
import type { SoilIndicator, InversionResult } from '@/types'

// 导入工具函数
import { createBaseMap, flyToRegion } from '@/utils/map-utils'
```

### 状态管理（Pinia）

**定义 Store**：
```typescript
// stores/map.ts
export const useMapStore = defineStore('map', () => {
  const center = ref<[number, number]>([110.3, 29.2])
  const zoom = ref(10)
  
  const setCenter = (newCenter: [number, number]) => {
    center.value = newCenter
  }
  
  return { center, zoom, setCenter }
})
```

**使用 Store**：
```typescript
// 在组件中
const mapStore = useMapStore()

// 读取状态
console.log(mapStore.center)

// 修改状态
mapStore.setCenter([116.3, 39.9])
```

**Store 列表**：
- `useAuthStore()` - 用户认证、登录状态
- `useMapStore()` - 地图中心点、缩放级别、图层状态
- `useDataStore()` - 反演数据、指标类型、时序数据
- `useAIStore()` - AI 分析结果、可信度、归因分析

### API 调用规范

**统一通过 services 层调用 API**：

```typescript
// services/modules/analysis.ts
import request from '../api'

export const startInversion = (params: InversionParams) => {
  return request.post('/analysis/inversion', params)
}

export const getInversionResult = (id: string) => {
  return request.get(`/analysis/result/${id}`)
}
```

**在组件中使用**：
```typescript
import { startInversion } from '@/services/modules/analysis'

const handleInversion = async () => {
  try {
    const result = await startInversion({
      indicator: 'organicMatter',
      dataSource: 'e4a7b9c2f6d1',
      model: 'rf'
    })
    ElMessage.success('反演成功')
  } catch (error) {
    ElMessage.error('反演失败')
  }
}
```

### 地图开发

**创建基础地图**：
```typescript
import { createBaseMap } from '@/utils/map-utils'

const mapContainer = ref<HTMLElement>()

onMounted(() => {
  if (mapContainer.value) {
    const map = createBaseMap(
      mapContainer.value,
      [110.3, 29.2],  // 中心点 [经度, 纬度]
      10              // 缩放级别
    )
  }
})
```

**添加遥感影像图层**：
```typescript
import { addRemoteSensingImage } from '@/utils/map-utils'

const layer = addRemoteSensingImage(
  map,
  '/demo_bundle/raw/raw_rgb_preview.png',
  [west, south, east, north]  // 影像边界
)
```

**行政区定位**：
```typescript
import { flyToRegion } from '@/utils/map-utils'

// 定位到湖南省张家界市
flyToRegion(map, ['湖南省', '张家界市'])
```

### 图表开发

**创建 ECharts 图表**：
```typescript
import * as echarts from 'echarts'
import { createGaugeConfig, createBarConfig } from '@/utils/chart-config'

const chartContainer = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value)
    
    // 使用预设配置
    const option = createGaugeConfig(72, '土壤质量')
    chart.setOption(option)
    
    // 响应式
    window.addEventListener('resize', () => {
      chart?.resize()
    })
  }
})

onUnmounted(() => {
  chart?.dispose()
})
```

### 样式开发

**使用 SCSS 变量**：
```scss
// 自动注入，直接使用
.my-component {
  color: $text-primary;
  background: $bg-dark;
  padding: $spacing-md;
}
```

**使用 SCSS 混入**：
```scss
.card {
  @include card-style;
  @include hover-effect;
}
```

### TypeScript 类型

**定义类型**：
```typescript
// types/index.ts
export interface SoilIndicator {
  id: string
  name: string
  value: number
  unit: string
  confidence: number
}

export type RiskLevel = 'high' | 'medium' | 'low'
```

**使用类型**：
```typescript
import type { SoilIndicator, RiskLevel } from '@/types'

const indicators = ref<SoilIndicator[]>([])
const riskLevel = ref<RiskLevel>('medium')
```

## 演示数据

项目内置演示数据包位于 `public/demo_bundle/`：

- **原始影像**: `raw/raw_rgb_preview.png` - 高光谱 RGB 预览
- **处理影像**: `processed/ndvi_preview.png` - NDVI 植被指数
- **地形数据**: `processed/dem_preview.png` - 数字高程模型
- **预测结果**: `results/pred_*.tif` - 各指标预测 GeoTIFF
- **不确定性**: `results/unc_*.tif` - 预测不确定性
- **元数据**: `DZ01V_L2_E110.3_N29.2_20251225031144_01_T1_MTL.txt`

元数据说明：
- 产品ID: DZ01V_L2
- 研究区域: 东经 110.02°-110.62°, 北纬 28.97°-29.51°
- 采集日期: 2025-12-25
- 卫星平台: DZ01
- 传感器: VNIR

## 部署说明

### 生产构建

```bash
# 1. 安装依赖
pnpm install

# 2. 构建生产版本
pnpm build

# 3. 测试构建结果
pnpm preview
```

### 静态部署

构建产物位于 `dist/` 目录，可部署到：

- **Nginx**: 配置静态文件服务
- **Apache**: 使用 `.htaccess` 配置路由
- **CDN**: 上传到阿里云 OSS、腾讯云 COS 等
- **静态托管**: Vercel、Netlify、GitHub Pages 等

**Nginx 配置示例**：
```nginx
server {
    listen 80;
    server_name example.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 常见问题

### Q1: 安装依赖失败？

**A**: 尝试以下方案：
```bash
# 清除缓存
pnpm store prune

# 删除 node_modules 和锁文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### Q2: 开发服务器启动失败？

**A**: 检查端口 5173 是否被占用：
```bash
# Windows
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :5173
```

### Q3: 地图不显示？

**A**: 检查：
1. OpenLayers 依赖是否正确安装
2. 地图容器是否有高度（设置 CSS `height`）
3. 浏览器控制台是否有错误

### Q4: TypeScript 类型错误？

**A**: 重新生成类型声明文件：
```bash
vue-tsc --declaration --emitDeclarationOnly
```

### Q5: 样式不生效？

**A**: 检查 SCSS 预处理器配置，确保 `sass` 已安装：
```bash
pnpm add -D sass
```

## 性能优化

### 1. 路由懒加载

```typescript
// 使用动态导入
{
  path: '/home',
  component: () => import('@/views/Home.vue')
}
```

### 2. 组件懒加载

```typescript
// 异步组件
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
```

### 3. 图片优化

- 使用 WebP 格式
- 懒加载图片（`loading="lazy"`）
- 压缩图片文件

### 4. 打包优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'echarts': ['echarts'],
          'openlayers': ['ol']
        }
      }
    }
  }
})
```

## 浏览器支持

| Browser | Version |
|---------|---------|
| Chrome  | >= 90   |
| Edge    | >= 90   |
| Firefox | >= 88   |
| Safari  | >= 14   |

**注意**：不支持 IE 浏览器。

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

**代码规范**：
- 遵循 ESLint 和 Prettier 规则
- 组件文件使用 PascalCase 命名
- 工具函数使用 camelCase 命名
- 添加适当的 TypeScript 类型注解
- 编写清晰的注释

## 更新日志

### v1.0.0 (2026-03-02)

**核心功能**：
- ✅ 用户登录认证
- ✅ 首页总览（多图层地图、AI分析）
- ✅ 数据管理（上传、查询、下载）
- ✅ 指标反演（5种指标、3种模型）
- ✅ 时序分析（对比视图、趋势图表）
- ✅ 成果报告（单图/时序报告生成）

**技术特性**：
- ✅ Vue 3 + TypeScript
- ✅ OpenLayers 地图引擎
- ✅ ECharts 图表可视化
- ✅ Pinia 状态管理
- ✅ Element Plus UI
- ✅ 自动导入机制
- ✅ SCSS 样式系统

## 许可证

AGPL License

## 联系方式

- **项目主页**: [GitHub Repository](#)
- **问题反馈**: [Issues](#)
- **技术支持**: support@dataeasy.com

---

**DataEasy** - 让土壤监测更简单、更智能

Made with ❤️ by DataEasy Team
