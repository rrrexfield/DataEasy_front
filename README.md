# 土壤质量智能监测平台

基于高光谱遥感的 AI 土壤指标反演系统

## 项目简介

本项目是一个土壤质量智能监测平台,利用高光谱遥感数据和 AI 技术,实现土壤质量指标的智能反演与分析。系统集成了数据管理、指标反演、时序分析和成果报告等核心功能,为土壤质量监测提供全流程解决方案。

## 技术栈

- **前端框架**: Vue 3.4 + TypeScript
- **构建工具**: Vite 5.0
- **UI 组件库**: Element Plus 2.5
- **地图库**: OpenLayers 8.2
- **图表库**: Apache ECharts 5.4
- **状态管理**: Pinia 2.1
- **路由管理**: Vue Router 4.2
- **HTTP 客户端**: Axios 1.6
- **样式预处理**: SCSS
- **代码规范**: ESLint + Prettier

## 核心功能

### 1. 首页总览
- 研究区地图展示
- 土壤质量综合指数可视化(仪表盘)
- AI 自动解读与风险提示
- 关键指标一览

### 2. 数据管理
- 高光谱遥感数据上传
- 数据查询与筛选
- 研究区管理
- 数据下载与删除

### 3. 指标反演
- 多指标选择(有机质、含水量、盐渍化)
- AI 算法模型选择
- 反演进度实时显示
- 反演结果空间分布图
- 统计信息与等级占比分析

### 4. 时序分析
- 多期影像时间轴控制
- 地图对比视图
- 指标变化趋势图表
- 动画播放功能

### 5. 成果报告
- 自动生成图文报告
- 报告预览与缩放
- 多格式导出(PDF/Word/图片)
- 自定义导出选项

## 项目结构

```
src/
├── views/              # 页面组件
│   ├── Home.vue       # 首页总览
│   ├── DataManagement.vue  # 数据管理
│   ├── Inversion.vue  # 指标反演
│   ├── TimeSeries.vue # 时序分析
│   └── Report.vue     # 成果报告
├── components/
│   └── layout/        # 布局组件
│       ├── MainLayout.vue
│       ├── Navbar.vue
│       └── Sidebar.vue
├── stores/            # Pinia 状态管理
│   ├── map.ts        # 地图状态
│   ├── data.ts       # 数据状态
│   └── ai.ts         # AI 分析状态
├── router/           # 路由配置
│   └── index.ts
├── services/         # API 服务层
│   ├── api.ts
│   └── modules/
│       ├── data.ts
│       ├── analysis.ts
│       └── report.ts
├── utils/            # 工具函数
│   ├── map-utils.ts
│   └── chart-config.ts
├── types/            # TypeScript 类型定义
│   ├── index.ts
│   └── api.ts
├── styles/           # 样式文件
│   ├── variables.scss
│   ├── global.scss
│   └── theme.scss
└── assets/           # 静态资源
```

## 快速开始

### 环境要求

- Node.js >= 18.0
- pnpm >= 8.0

### 安装依赖

```bash
pnpm install
```

### 开发运行

```bash
pnpm dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

### 代码检查

```bash
pnpm lint
```

### 代码格式化

```bash
pnpm format
```

## 环境变量

项目使用 `.env` 文件配置环境变量:

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

主要配置项:
- `VITE_APP_TITLE` - 应用标题
- `VITE_API_BASE_URL` - API 基础地址
- `VITE_MAP_CENTER` - 地图初始中心点
- `VITE_MAP_ZOOM` - 地图初始缩放级别

## 开发说明

### 自动导入

项目配置了 `unplugin-auto-import` 和 `unplugin-vue-components`,支持:
- Vue 3 Composition API 自动导入
- Element Plus 组件自动导入
- 无需手动 import

### 路径别名

使用 `@` 作为 `src` 目录的别名:

```typescript
import { useMapStore } from '@/stores'
import type { SoilIndicator } from '@/types'
```

### 状态管理

使用 Pinia 进行状态管理,主要 store:
- `useMapStore()` - 地图状态(图层、中心点、缩放)
- `useDataStore()` - 数据状态(指标、时序数据)
- `useAIStore()` - AI 分析状态(分析结果、进度)

### API 调用

所有 API 调用统一通过 `services` 层:

```typescript
import { startInversion } from '@/services/modules/analysis'

const result = await startInversion({
  studyAreaId: 'area-a',
  indicator: 'organicMatter',
  date: '2024-03-15'
})
```

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 许可证

MIT License

## 联系方式

如有问题或建议,请联系项目维护者。

---

**DataEasy Front** - 土壤质量智能监测平台前端项目
