# DataEasy AI Coding Instructions

## Project Overview
DataEasy is a **soil quality monitoring platform** using high-spectral remote sensing and AI for inversion analysis. Built with Vue 3 + TypeScript, it provides end-to-end workflow from data management to AI-powered reports.

**Key Architecture**: Single-page application with 5 main views (Login, Home, DataManagement, Inversion, TimeSeries, Report), OpenLayers map engine, ECharts visualization, and Pinia state management.

## Auto-Import System (Critical!)
**NEVER manually import** Vue APIs or Element Plus components - they're auto-imported via unplugin-auto-import/unplugin-vue-components:

```typescript
// ❌ DON'T DO THIS
import { ref, computed } from 'vue'
import { ElButton } from 'element-plus'

// ✅ CORRECT - Just use directly
const count = ref(0)
<el-button>Click</el-button>
```

Auto-imported: `ref`, `computed`, `watch`, `onMounted`, `useRouter`, `useRoute`, all Pinia composables, all Element Plus components.

## File Structure & Naming
- **Views**: PascalCase (e.g., `DataManagement.vue`)
- **Utils/Services**: camelCase (e.g., `map-utils.ts`, `chart-config.ts`)
- **Stores**: camelCase with `use` prefix (e.g., `useMapStore()`)
- **Path alias**: Always use `@/` for src imports: `import { useMapStore } from '@/stores'`

## State Management Pattern (Pinia)
Use **setup store** pattern (Composition API style):

```typescript
// stores/example.ts
export const useExampleStore = defineStore('example', () => {
  const data = ref<DataType[]>([])
  const loading = ref(false)
  
  const fetchData = async () => {
    loading.value = true
    // fetch logic
    loading.value = false
  }
  
  return { data, loading, fetchData }
})
```

**Key stores**: `useAuthStore()` (auth), `useMapStore()` (map center/zoom/layers), `useDataStore()` (inversion data), `useAIStore()` (AI results/confidence).

## API Service Layer
**Always use the services layer** - never call axios directly in components:

```typescript
// services/modules/analysis.ts
import request from '../api'

export const startInversion = (params: InversionParams) => {
  return request.post('/analysis/inversion', params)
}

// In component
import { startInversion } from '@/services/modules/analysis'
const result = await startInversion({ indicator: 'OC', model: 'rf' })
```

## Map Development (OpenLayers)
**Standard pattern** from `utils/map-utils.ts`:

```typescript
import { createBaseMap, addRemoteSensingImage, flyToRegion } from '@/utils/map-utils'

// Always ref the container
const mapContainer = ref<HTMLElement>()
let map: any = null

onMounted(() => {
  if (mapContainer.value) {
    map = createBaseMap(mapContainer.value, [110.3, 29.2], 10)
  }
})
```

**Image layers**: Use `addRemoteSensingImage()` with GeoJSON bounds. **Region navigation**: Use `flyToRegion(map, ['湖南省', '张家界市'])` for admin area navigation.

## Chart Development (ECharts)
**Use pre-configured helpers** from `utils/chart-config.ts`:

```typescript
import * as echarts from 'echarts'
import { createGaugeConfig, createBarConfig, createLineConfig } from '@/utils/chart-config'

const chartContainer = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value)
    const option = createGaugeConfig(72, '土壤质量')
    chart.setOption(option)
    
    window.addEventListener('resize', () => chart?.resize())
  }
})

onUnmounted(() => chart?.dispose())
```

## SCSS Style System
**Variables/mixins are auto-injected** - use directly without importing:

```scss
.my-component {
  color: $text-primary;           // From variables.scss
  background: $bg-dark;
  @include card-style;            // From mixins.scss
  @include hover-effect;
}
```

**Light Style Design Philosophy** (see `LightStyle.md`):
- Dark background (#000 ~ #1A1A1A) with glowing elements
- Multi-layer glow: `box-shadow: 0 0 5px #00ffcc, 0 0 10px #00ffcc, 0 0 40px #00ffcc`
- Spotlight effects with radial gradients
- Frosted glass: `backdrop-filter: blur(10px)` + semi-transparent backgrounds
- Hover = charging effect (expand glow, increase brightness)

## TypeScript Patterns
**Always define types** for component props, API responses, and store state:

```typescript
// types/index.ts
export interface SoilIndicator {
  id: string
  name: string
  value: number
  unit: string
  confidence: number
}

// Use in component
import type { SoilIndicator } from '@/types'
const indicators = ref<SoilIndicator[]>([])
```

## Route Guards & Auth
Router has **auth guard** in `router/index.ts`. Protected routes have `meta.requiresAuth !== false`. Use `useAuthStore().checkAuth()` to verify login status.

## Element Plus Multi-line Attributes
**ESLint enforces** attributes on new lines for readability:

```vue
<!-- ✅ CORRECT -->
<el-button
  type="primary"
  :icon="DataAnalysis"
  @click="handleClick"
>
  Text
</el-button>

<!-- ❌ WRONG -->
<el-button type="primary" :icon="DataAnalysis">Text</el-button>
```

## Demo Data Location
Test data in `public/demo_bundle/`:
- `raw/raw_rgb_preview.png` - Original RGB
- `processed/ndvi_preview.png` - NDVI processed
- `results/pred_*.tif` - Prediction GeoTIFF
- `DZ01V_*_MTL.txt` - Metadata (parse with `metadata-parser.ts`)

## Key Commands
```bash
pnpm dev          # Start dev server (port 5173)
pnpm build        # Type-check + build
pnpm lint         # ESLint auto-fix
pnpm format       # Prettier format
```

## Common Patterns
1. **Nullable timer cleanup**: Always check `!== null` before `clearInterval(playInterval)`
2. **Map layer management**: Toggle visibility with `layer.setVisible(bool)`, not CSS display
3. **Report generation**: Single-image reports include detailed GeoJSON bounds from MTL metadata
4. **Confidence visualization**: Use color-coded progress bars (green=high, yellow=medium, red=low)
5. **Risk zones**: Overlay markers with `pixelPosition` calculated from lon/lat using `lonLatToPixel()`

## What Makes This Project Unique
- **AI uncertainty quantification**: Every prediction includes confidence scores and risk zone identification
- **Multi-layer remote sensing**: 6 overlay layers (RGB, organic matter, moisture, NDVI, uncertainty, DEM) with transparency control
- **Attribution analysis**: Break down AI results into factor contributions (organic matter 35%, moisture 28%, etc.)
- **Dual-view time series**: Side-by-side map comparison with synchronized controls
- **MTL metadata parsing**: Custom parser for DZ01V satellite metadata in `metadata-parser.ts`

## Style Guide Highlights
- Components: `<script setup lang="ts">` + Composition API
- Reactive data: Always use `ref()` or `reactive()`, never plain `let`
- Event handlers: Prefix with `handle` (e.g., `handleClick`, `handleDataSelect`)
- Async operations: Show loading states, use try-catch with ElMessage for errors
- Map/Chart refs: Type as `ref<HTMLElement>()`, check before initialization
