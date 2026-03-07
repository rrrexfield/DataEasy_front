# DataEasy 数据库重构说明

## 概述

本次重构将所有展示用的外部数值从硬编码形式迁移到本地 SQLite 数据库中，实现了数据与代码的分离，提高了可维护性和可扩展性。

## 技术架构

### 1. 数据库引擎
- **sql.js**: 基于 WebAssembly 的 SQLite，完全运行在浏览器中
- **存储方式**: localStorage（持久化）
- **数据库文件**: `dataeasy.db`（Base64 编码存储）

### 2. 目录结构

```
apps/web/src/
├── db/
│   ├── schema.sql          # 数据库表结构定义
│   ├── seed.sql            # 初始数据SQL脚本
│   ├── database.ts         # 数据库服务层（单例）
│   └── api.ts              # 类型安全的CRUD接口
├── composables/
│   └── useDatabase.ts      # Vue Composable钩子
└── views/
    ├── Home.vue            # 已重构：使用数据库API
    ├── DataManagement.vue  # 已重构：使用数据库API
    └── Report.vue          # 已重构：使用数据库API
```

### 3. 数据库表设计

| 表名 | 说明 | 主要字段 |
|------|------|---------|
| `inversion_data` | 反演数据列表 | id, name, study_area, date, type, size |
| `image_layers` | 遥感图层配置 | id, name, url, visible, opacity, category |
| `risk_zones` | 风险区域标注 | id, label, risk_level, confidence, lon, lat |
| `attribution_factors` | 归因因子数据 | id, name, pct, color, hint |
| `soil_indicators` | 土壤指标配置 | code, label, unit, mean, max, min, std |
| `timeline_data` | 时序数据 | id, date, seq |
| `reports` | 报告列表 | id, name, analysis_type, indicators(JSON) |
| `soil_index` | 土壤综合指数 | value, uncertainty, confidence_level |

## 使用指南

### 1. 数据库初始化

数据库会在应用启动时自动初始化（参见 `main.ts`）：

```typescript
import db from './db/database'

db.initialize().then(() => {
  console.log('✅ 数据库初始化完成')
  app.mount('#app')
})
```

### 2. 在组件中使用数据

#### 方式一：使用 Composable（推荐）

```vue
<script setup lang="ts">
import { useInversionData } from '@/composables/useDatabase'

const { dataList, deleteData } = useInversionData()

// dataList 是响应式的 ref，会自动从数据库加载
console.log(dataList.value)  // [{ id: '...', name: '...', ... }]

// 删除数据
deleteData('some-id')
</script>
```

#### 方式二：直接使用 API

```typescript
import { inversionDataAPI } from '@/db/api'

// 查询所有数据
const allData = inversionDataAPI.getAll()

// 查询单条数据
const data = inversionDataAPI.getById('e4a7b9c2f6d1')

// 创建新数据
inversionDataAPI.create({
  name: '新数据',
  studyArea: '研究区X',
  date: '2024-03-01',
  type: '高光谱',
  size: '50MB'
})

// 删除数据
inversionDataAPI.delete('some-id')
```

### 3. 可用的 Composables

| Composable | 说明 | 返回值 |
|-----------|------|-------|
| `useInversionData()` | 反演数据管理 | `{ dataList, deleteData, refresh }` |
| `useImageLayers()` | 图层配置管理 | `{ layers, updateVisibility, updateOpacity }` |
| `useRiskZones()` | 风险区域数据 | `{ zones }` |
| `useSoilIndex()` | 土壤综合指数 | `{ soilIndex, update }` |
| `useAttributionFactors()` | 归因因子管理 | `{ factors, reset }` |
| `useSoilIndicators()` | 土壤指标配置 | `{ indicators }` |
| `useTimelineData()` | 时序数据 | `{ timeline }` |
| `useReports()` | 报告管理 | `{ reports, getById, create, deleteReport }` |

### 4. 数据持久化

- **自动保存**: 所有修改操作（INSERT/UPDATE/DELETE）会自动保存到 localStorage
- **手动保存**: `db.save()` （通常不需要手动调用）
- **清除数据**: `db.clear()` （开发/测试用）

### 5. 数据导出/导入

```typescript
import db from '@/db/database'

// 导出数据库文件（Uint8Array）
const dbData = db.export()

// 下载数据库副本
const blob = new Blob([dbData], { type: 'application/x-sqlite3' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'dataeasy_backup.db'
a.click()
```

## 已完成的重构

### 1. Home.vue ✅
- ❌ 删除: `inversionDataList` 硬编码（3条数据）
- ❌ 删除: `imageLayers` 硬编码（14个图层）
- ❌ 删除: `riskZones` 硬编码（3个风险区）
- ❌ 删除: `soilIndex` 硬编码
- ❌ 删除: `attributionFactors` 硬编码（4个因子）
- ✅ 改用: 数据库 Composables
- ✅ 新增: 图层状态同步到数据库

### 2. DataManagement.vue ✅
- ❌ 删除: `tableData` 硬编码
- ✅ 改用: `useInversionData()`
- ✅ 新增: 删除操作同步数据库

### 3. Report.vue ✅
- ❌ 删除: `inversionDataList` 硬编码
- ❌ 删除: `reportList` 硬编码（2个报告）
- ✅ 改用: `useInversionData()` + `useReports()`
- ✅ 新增: 生成报告保存到数据库

### 4. 待完成（可选）
- Inversion.vue: `indicatorConfig` → `useSoilIndicators()`
- TimeSeries.vue: `timelineData` → `useTimelineData()`

## 数据库管理

### 1. 重置数据库

在浏览器控制台执行：

```javascript
localStorage.removeItem('dataeasy.db')
location.reload()
```

### 2. 查看数据库状态

```javascript
import db from '@/db/database'

// 查询反演数据
const data = db.query('SELECT * FROM inversion_data')
console.table(data)

// 查询图层配置
const layers = db.query('SELECT id, name, visible FROM image_layers')
console.table(layers)
```

### 3. 修改种子数据

编辑 `src/db/seed.sql`，然后重置数据库即可。

## 性能优化

- ✅ 数据库文件缓存在 localStorage（避免重复加载）
- ✅ 索引优化（date, category 等字段）
- ✅ 懒加载：只在需要时查询数据
- ✅ 响应式更新：使用 Vue ref 自动刷新 UI

## 注意事项

1. **浏览器兼容性**: 需要支持 WebAssembly 的现代浏览器
2. **存储限制**: localStorage 通常限制   5-10MB，当前数据库 < 1MB
3. **并发安全**: sql.js 是单线程的，不存在并发问题
4. **数据迁移**: 老用户首次访问时会自动初始化数据库

## 故障排查

### Q: 数据库初始化失败？
**A**: 检查 CDN 是否可访问：`https://cdn.jsdelivr.net/npm/sql.js@1.8.0/`

### Q: 数据没有持久化？
**A**: 确保每次修改后调用了 `db.save()`（CRUD API 已自动调用）

### Q: 如何恢复默认数据？
**A**: 清除 localStorage 并刷新页面

## 技术优势

1. **数据与代码分离**: 不再需要修改代码来更新展示数据
2. **类型安全**: TypeScript 接口保证数据结构一致性
3. **版本控制**: 数据库 schema 可通过 SQL 文件进行版本管理
4. **易于扩展**: 添加新表只需修改 schema.sql 和 api.ts
5. **离线可用**: 完全运行在客户端，无需后端支持
6. **标准 SQL**: 使用标准 SQL 语法，易于学习和维护

## 未来扩展

- [ ] 数据库版本迁移机制
- [ ] 数据导入/导出界面
- [ ] 数据库备份与恢复
- [ ] 多用户数据隔离（localStorage per user）
- [ ] 数据同步到云端（可选）

---

**重构完成时间**: 2026-03-06  
**重构负责人**: GitHub Copilot  
**数据库版本**: 1.0.0
