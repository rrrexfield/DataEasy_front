# DataEasy 移动端客户端实施指导（复用优先版）

## 1. 文档目标

本指南用于在 `apps/mobile` 中建设 DataEasy 移动端客户端，核心原则是：

1. 最大化复用 `apps/web` 的设计风格、业务结构与静态资源（例如 Logo、数据库、演示数据）。
2. 保留 Web 端页面划分与业务边界，避免移动端出现“重新发明一套功能”。
3. 保持代码组织可长期维护，优先共享到 `packages/common`，减少端间分叉。

---

## 2. 现状与目标差距

### 2.1 已有基础（mobile）

- 已有页面文件：`Login.vue`、`Home.vue`、`Data.vue`、`Inversion.vue`、`TimeSeries.vue`、`Report.vue`
- 已有基础状态管理：`src/stores/auth.ts`、`map.ts`、`data.ts`、`ai.ts`
- 已接入 Vant、OpenLayers、ECharts、Capacitor
- 已配置移动端适配（`postcss-px-to-viewport`）

### 2.2 当前关键缺口

- 页面功能与 Web 端尚未对齐，部分页面仍是演示级数据。
- 移动端未复用 Web 端数据库层（`apps/web/src/db`），数据来源仍以硬编码为主。
- 移动端未复用 Web 端 Logo 资源（`apps/mobile` 无 `public/` 目录）。
- 路由命名与页面分组和 Web 存在不一致（如 `Data` vs `DataManagement`）。

---

## 3. 复用优先原则（必须遵守）

### 3.1 页面划分保持一致

以 Web 端 6 个业务页面为标准：

1. `Login`
2. `Home`
3. `DataManagement`
4. `Inversion`
5. `TimeSeries`
6. `Report`

移动端可做交互压缩，但不能改变页面职责边界。

### 3.2 风格系统保持一致

直接复用 Web 的 Light 风格变量体系：

- 颜色变量参考：`apps/web/src/styles/variables.scss`
- 移动端变量文件：`apps/mobile/src/styles/variables.scss`
- 要求两端主色、背景层级、发光体系命名一致（如 `$neon-cyan`、`$bg-primary`）

### 3.3 数据层保持一致

优先复用 Web 端数据库方案：

- 服务层：`apps/web/src/db/database.ts`
- API 层：`apps/web/src/db/api.ts`
- 数据结构：`apps/web/src/db/schema.sql`
- 初始数据：`apps/web/src/db/seed.sql`

### 3.4 静态资源优先复用

Logo 与演示数据统一来源：

- Logo：`apps/web/public/Dataeasy.png`、`apps/web/public/Dataeasy512.png`
- Demo 数据：`apps/web/public/demo_bundle/`

---

## 4. 文件级复用清单

## 4.1 直接复制（一次性）

1. `apps/web/public/Dataeasy.png` -> `apps/mobile/public/Dataeasy.png`
2. `apps/web/public/Dataeasy512.png` -> `apps/mobile/public/Dataeasy512.png`
3. `apps/web/src/db/schema.sql` -> `apps/mobile/src/db/schema.sql`
4. `apps/web/src/db/seed.sql` -> `apps/mobile/src/db/seed.sql`

## 4.2 结构复用（按移动端适配）

1. `apps/web/src/db/database.ts` -> 迁移为 `apps/mobile/src/db/database.ts`
2. `apps/web/src/db/api.ts` -> 迁移为 `apps/mobile/src/db/api.ts`
3. `apps/web/src/composables/useDatabase.ts` -> 新增 `apps/mobile/src/composables/useDatabase.ts`

说明：适配内容仅限运行环境差异，不改业务接口命名。

## 4.3 统一抽取到 `packages/common`

适合跨端共享的模块：

1. 类型定义（如 `SoilIndicator`、`Report`、`RiskZone`）
2. 纯业务函数（格式化、校验、转换）
3. API 客户端封装

不放入 common 的内容：

1. Vue 组件
2. Vant / Element Plus 组件代码
3. OpenLayers 具体实例创建（可保留平台差异）

---

## 5. 页面映射设计（保留 Web 页面划分）

### 5.1 路由命名建议

移动端路由建议与 Web 语义对齐：

1. `/login` -> `Login`
2. `/home` -> `Home`
3. `/data` -> `DataManagement`
4. `/inversion` -> `Inversion`
5. `/time-series` 或 `/timeseries` -> `TimeSeries`（推荐统一为 `/time-series`）
6. `/report` -> `Report`

### 5.2 页面职责对齐表

1. `Login`
- 复用 Web 认证流程（token、重定向、守卫）
- UI 保留 Light 风格，可继续使用现有移动端动态背景

2. `Home`
- 地图主视图、图层开关、AI 综合评分、风险区域入口
- 与 Web 首页保持同一数据口径

3. `DataManagement`
- 数据列表、检索、查看详情、删除/管理
- 数据源来自数据库 API，不允许硬编码常量列表

4. `Inversion`
- 参数选择、任务执行、进度反馈、结果展示
- 指标/模型/数据源选项来自数据库或公共配置

5. `TimeSeries`
- 时间轴播放、时相切换、趋势图、双时相对比
- 复用 Web 的时间序列结构与统计逻辑

6. `Report`
- 报告列表、预览、导出、证据链视图入口
- 报告元数据与统计结果使用同一数据库数据源

---

## 6. 技术实施方案

## 6.1 目录调整（mobile）

新增目录与文件：

```text
apps/mobile/src/
  db/
    database.ts
    api.ts
    schema.sql
    seed.sql
  composables/
    useDatabase.ts
```

新增静态资源目录：

```text
apps/mobile/public/
  Dataeasy.png
  Dataeasy512.png
  demo_bundle/ (按需复制)
```

## 6.2 依赖补齐

`apps/mobile/package.json` 需要补充：

1. `sql.js`（与 Web 一致版本，建议 `^1.14.1`）

说明：移动端已具备 `@dataeasy/common`，可继续承接跨端类型与工具。

## 6.3 启动流程建议

在 `apps/mobile/src/main.ts` 中增加数据库初始化流程，模式与 Web 对齐：

1. 启动时先 `await db.initialize()`
2. 初始化成功后再 `app.mount('#app')`
3. 初始化失败进入兜底页面或 toast 错误提示

## 6.4 路由守卫统一

当前移动端守卫基于 `localStorage token`，建议改为与 store 一致：

1. 在守卫中使用 `useAuthStore().isAuthenticated` 或 `checkAuth()`
2. 支持 `redirect` 查询参数
3. 登录页已认证跳转 `home`

---

## 7. UI 复用策略（Web Element Plus -> Mobile Vant）

保留视觉语言，不强行复刻组件。

### 7.1 组件映射建议

1. `el-table` -> `van-list + van-cell`（卡片化）
2. `el-form + el-select` -> `van-form + van-field + van-picker`
3. `el-dialog` -> `van-popup`
4. `el-drawer` -> `van-popup(position='right')`
5. `el-progress` -> `van-progress`
6. `el-tabs` -> `van-tabs`

### 7.2 风格一致性规则

1. 主色统一 `$neon-cyan`
2. 背景层级统一 `$bg-primary/$bg-secondary/$bg-elevated`
3. 卡片统一半透明+毛玻璃+弱发光
4. 状态色保持 Web 业务语义（成功/警告/风险）

---

## 8. 迁移实施分阶段计划

## 阶段 A：资源与数据底座（优先级 P0）

1. 创建 `apps/mobile/public/`，复制 Logo 与必要 demo 资源。
2. 复制并接入 `apps/web/src/db` 到 `apps/mobile/src/db`。
3. 安装 `sql.js`，完成移动端数据库初始化。
4. 新增 `useDatabase.ts`，将数据查询封装为 composable。

验收标准：

1. 移动端可从本地数据库加载 `inversion_data`。
2. 页面重载后数据持久化不丢失。

## 阶段 B：路由与页面语义对齐（优先级 P0）

1. 路由 name 统一为 Web 语义（特别是 `DataManagement`）。
2. 统一时间序列路径格式（建议 `/time-series`）。
3. 清理与主业务线无关的导航入口（如遗留 `Analysis/Profile` tab 结构）。

验收标准：

1. 登录守卫逻辑一致。
2. 6 个页面职责与 Web 一一对应。

## 阶段 C：页面功能迁移（优先级 P1）

1. `Home`：图层控制、AI摘要、风险点联动。
2. `DataManagement`：列表/搜索/详情/删除（全量走 db api）。
3. `Inversion`：参数-执行-结果闭环。
4. `TimeSeries`：时间轴播放+对比地图+趋势图。
5. `Report`：列表+预览+导出。

验收标准：

1. 无核心硬编码业务数据。
2. 主要功能在移动端可闭环操作。

## 阶段 D：共享沉淀与优化（优先级 P2）

1. 抽取可复用类型与工具到 `packages/common`。
2. 优化 OpenLayers 图层加载与内存回收。
3. 细化 Capacitor 真机能力（状态栏、安全区、权限处理）。

验收标准：

1. common 包中有明确新增模块。
2. 真机滚动与地图拖拽体验可接受。

---

## 9. 关键代码规范（与项目约定一致）

1. Vue/Pinia/Vant 使用自动导入，避免重复手写导入。
2. 组件内禁止直接 `axios`，统一走服务层或 db api。
3. 类型必须显式定义，接口与 store 均使用 TypeScript 类型。
4. 异步流程必须有 loading、错误提示与兜底状态。
5. 地图/图表初始化必须在容器 ref 可用后执行，并在卸载时释放资源。

---

## 10. 风险与规避

1. 风险：移动端性能下降（地图+图表同屏）
- 规避：限制同屏图层数量，按需渲染图表，离屏销毁实例。

2. 风险：数据库初始化失败（网络/CDN不可用）
- 规避：保留重试机制与降级提示；sql.js 文件可考虑本地托管。

3. 风险：样式偏离 Web 风格
- 规避：颜色和阴影统一走变量，不允许页面内写散装主题色。

4. 风险：页面职责漂移
- 规避：严格对照“6页面职责表”评审。

---

## 11. 交付验收清单

功能验收：

1. 登录后可进入首页，登出后回登录页。
2. 6 个页面路由均可访问，职责符合 Web 对应页面。
3. 数据管理、反演、时序、报告具备最小可用闭环。
4. 报告数据与首页/时序统计口径一致。

复用验收：

1. 移动端使用 Web 同款 Logo 资源。
2. 移动端已复用或等价迁移 Web 数据库 schema/api。
3. 主题变量与 Light 风格命名体系一致。

工程验收：

1. `pnpm --filter @dataeasy/mobile build` 通过。
2. 关键页面无 TypeScript 错误。
3. 主要交互在真机或模拟器可运行。

---

## 12. 推荐执行顺序（可直接落地）

1. 先完成 `public` 和 `db` 复用，再改页面。
2. 第二步统一路由语义与守卫。
3. 第三步按 `Home -> DataManagement -> Inversion -> TimeSeries -> Report` 顺序迁移。
4. 最后做 common 抽取和真机优化。

该顺序能保证移动端最早获得“可用且一致”的业务骨架，避免后续返工。
