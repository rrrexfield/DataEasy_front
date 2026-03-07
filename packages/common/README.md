# @dataeasy/common

DataEasy 共享业务逻辑、API 和工具函数包。

## 功能

- ✅ TypeScript 类型定义
- ✅ API 服务封装
- ✅ 通用工具函数
- ✅ 跨平台支持（Web + Mobile）

## 安装

在 workspace 内自动安装：

```json
{
  "dependencies": {
    "@dataeasy/common": "workspace:*"
  }
}
```

## 使用

### 类型定义

```typescript
import type { SoilIndicator, InversionParams, ReportData } from '@dataeasy/common/types'

const indicator: SoilIndicator = {
  id: '001',
  name: '有机质',
  value: 45.8,
  unit: 'g/kg',
  confidence: 0.92
}
```

### API 服务

```typescript
import { createApiClient, dataApi, analysisApi, reportApi } from '@dataeasy/common/api'

// 创建客户端
const client = createApiClient('http://api.example.com')

// 数据管理
const dataList = await dataApi(client).getDataList()
await dataApi(client).uploadData(formData)

// 反演分析
const result = await analysisApi(client).startInversion({
  indicator: 'OC',
  region: ['湖南省', '张家界市'],
  dataSource: 'e4a7b9c2f6d1',
  model: 'rf'
})

// 报告生成
const reportList = await reportApi(client).getReportList()
```

### 工具函数

```typescript
import { 
  formatDate, 
  formatFileSize,
  debounce,
  throttle,
  storage,
  coordUtils 
} from '@dataeasy/common/utils'

// 日期格式化
const dateStr = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')

// 文件大小格式化
const sizeStr = formatFileSize(1024 * 1024) // "1.00 MB"

// 防抖
const debouncedSearch = debounce((keyword: string) => {
  console.log('搜索:', keyword)
}, 300)

// 节流
const throttledScroll = throttle(() => {
  console.log('滚动')
}, 100)

// 本地存储
storage.set('user', { name: 'DataEasy' })
const user = storage.get('user')

// 坐标转换
const [lon, lat] = coordUtils.wgs84ToGcj02(110.3, 29.2)
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（实时编译）
pnpm dev

# 构建
pnpm build

# 清理
pnpm clean
```

## 项目结构

```
packages/common/
├── src/
│   ├── index.ts         # 主入口
│   ├── types/
│   │   └── index.ts     # 类型定义
│   ├── api/
│   │   └── index.ts     # API 服务
│   └── utils/
│       └── index.ts     # 工具函数
├── dist/                # 编译输出
├── package.json
└── tsconfig.json
```

## 导出模块

```typescript
// 全部导入
import * as common from '@dataeasy/common'

// 按需导入
import { SoilIndicator } from '@dataeasy/common/types'
import { createApiClient } from '@dataeasy/common/api'
import { formatDate } from '@dataeasy/common/utils'
```

## 添加新功能

### 1. 添加类型

编辑 `src/types/index.ts`：

```typescript
export interface NewType {
  id: string
  name: string
}
```

### 2. 添加 API

编辑 `src/api/index.ts`：

```typescript
export const newApi = (client: AxiosInstance) => ({
  getData: () => client.get('/new/data'),
})
```

### 3. 添加工具函数

编辑 `src/utils/index.ts`：

```typescript
export const newUtil = (input: string): string => {
  return input.toUpperCase()
}
```

### 4. 重新构建

```bash
pnpm build
```

## 注意事项

1. **只包含跨平台代码**
   - 不要依赖浏览器特定 API
   - 不要依赖 Node.js 特定 API
   - 使用条件判断处理平台差异

2. **保持轻量级**
   - 避免大型依赖
   - 按需导入

3. **类型安全**
   - 所有函数都应有类型定义
   - 导出的类型都应有文档注释

## 版本管理

使用 changesets 管理版本：

```bash
# 添加变更日志
pnpm changeset

# 发布版本
pnpm changeset version
pnpm changeset publish
```

## License

MIT
