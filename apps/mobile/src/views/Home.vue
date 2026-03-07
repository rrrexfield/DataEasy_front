<template>
  <div class="home-page">
    <van-nav-bar
      title="土壤质量监测"
      fixed
      placeholder
    />

    <div class="home-content">
      <van-collapse v-model="mapPanelActive" class="map-collapse">
        <van-collapse-item name="map">
          <template #title>
            <span class="panel-title">研究区地图</span>
          </template>

          <div class="map-section">
            <div
              ref="mapContainer"
              class="map-container"
            />

            <div class="map-alert-banner">
              发现 <strong>{{ highRiskCount }} 处</strong>高风险区域
            </div>

            <div v-if="showWarningOverlay" class="map-overlay">
              <div
                v-for="zone in zones"
                :key="zone.id"
                class="risk-zone-marker"
                :class="`risk-zone-marker--${zone.riskLevel}`"
                :style="zone.pixelPosition ? { left: `${zone.pixelPosition[0]}px`, top: `${zone.pixelPosition[1]}px` } : {}"
                @click.stop="handleZoneClick(zone.id)"
              >
                <span class="risk-zone-dot" />
              </div>

              <div
                v-if="activeZone"
                class="zone-info-card"
              >
                <div class="zone-info-head">
                  <span class="zone-info-title">{{ activeZone.label }}</span>
                  <van-icon
                    name="cross"
                    class="zone-close"
                    @click.stop="activeZoneId = null"
                  />
                </div>
                <div class="zone-info-row">风险等级: {{ activeZone.riskText }}</div>
                <div class="zone-info-row">可信度: {{ activeZone.confidence }}</div>
                <div class="zone-info-row">建议动作: {{ activeZone.action }}</div>
                <div class="zone-info-hint">{{ activeZone.hint }}</div>
              </div>
            </div>

            <van-button
              type="primary"
              size="small"
              class="layer-btn"
              @click="showLayerPopup = true"
            >
              图层
            </van-button>
          </div>
        </van-collapse-item>
      </van-collapse>

      <div class="data-card">
        <div class="factor-card panel-card">
          <div class="factor-title">综合概览</div>

          <div class="factor-row overview-row">
            <div class="factor-head">
              <span class="factor-name">土壤质量指数</span>
              <span class="factor-pct">{{ qualityScore }}/100</span>
            </div>
          </div>

          <div class="factor-row overview-row">
            <div class="factor-head">
              <span class="factor-name">模型不确定性</span>
              <span class="factor-pct">{{ uncertainty }}%</span>
            </div>
          </div>

          <div class="factor-row overview-row confidence-row">
            <div class="factor-head">
              <span class="factor-name">可信度</span>
              <span class="confidence-text">{{ confidenceText }} ({{ confidencePct }}%)</span>
            </div>
            <div class="confidence-wrap">
              <van-progress
                :percentage="confidencePct"
                :show-pivot="false"
                color="#00ffcc"
              />
            </div>
          </div>

          <div class="factor-row overview-row">
            <div class="factor-head">
              <span class="factor-name">有机质含量</span>
              <span class="factor-pct">{{ organicMatter }} g/kg</span>
            </div>
          </div>

          <div class="factor-row overview-row">
            <div class="factor-head">
              <span class="factor-name">土壤含水量</span>
              <span class="factor-pct">{{ waterContent }}%</span>
            </div>
          </div>

          <div class="factor-row overview-row">
            <div class="factor-head">
              <span class="factor-name">风险区域</span>
              <span class="factor-pct">{{ riskCount }} 个</span>
            </div>
          </div>
        </div>

        <div class="factor-card panel-card mt-card">
          <div class="factor-title">风险区域识别</div>
          <div
            v-for="zone in topRiskZones"
            :key="zone.id"
            class="factor-row"
          >
            <div class="factor-head">
              <span class="factor-name">{{ zone.label }}</span>
              <van-tag :type="zone.tagType">{{ zone.action }}</van-tag>
            </div>
            <div class="factor-hint">{{ zone.hint }}</div>
          </div>
        </div>

        <div class="factor-card panel-card mt-card">
          <div class="factor-title">归因分析（Top 因子）</div>
          <div
            v-for="factor in topFactors"
            :key="factor.name"
            class="factor-row"
          >
            <div class="factor-head">
              <span class="factor-name">{{ factor.name }}</span>
              <span class="factor-pct">{{ factor.pct }}%</span>
            </div>
            <div class="factor-bar-bg">
              <div
                class="factor-bar-fg"
                :style="{ width: `${Math.min(100, factor.pct)}%`, background: factor.color || '#00ffcc' }"
              />
            </div>
            <div class="factor-hint">{{ factor.hint }}</div>
          </div>
        </div>
      </div>
    </div>

    <AppTabbar />

    <!-- 图层选择弹出层 -->
    <van-popup
      v-model:show="showLayerPopup"
      position="bottom"
      :style="{ height: '56%' }"
    >
      <div class="layer-popup">
        <h3>图层管理</h3>
        <div class="layer-list">
          <div
            v-for="layer in layers"
            :key="layer.id"
            class="layer-row"
          >
            <div class="layer-row-top">
              <span class="layer-name">{{ layer.name }}</span>
              <van-switch
                :model-value="layer.visible"
                size="20"
                @update:model-value="(val) => handleLayerToggle(layer, val)"
              />
            </div>
            <div class="layer-row-bottom">
              <span class="opacity-text">透明度 {{ layer.opacity }}%</span>
              <div class="layer-controls">
                <van-slider
                  :model-value="layer.opacity"
                  :min="0"
                  :max="100"
                  :step="5"
                  class="opacity-slider"
                  @update:model-value="(val) => handleLayerOpacityChange(layer, val)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { createBaseMap, addRemoteSensingImage, lonLatToPixel } from '@/utils/map-utils'
import { useAttributionFactors, useImageLayers, useRiskZones, useSoilIndex } from '@/composables/useDatabase'

const mapContainer = ref<HTMLElement>()
const showLayerPopup = ref(false)
const mapPanelActive = ref(['map'])
const imageExtent: [number, number, number, number] = [110.15, 29.05, 110.45, 29.35]

const { layers, updateVisibility, updateOpacity } = useImageLayers()
const { zones } = useRiskZones()
const { soilIndex } = useSoilIndex()
const { factors } = useAttributionFactors()
const qualityScore = computed(() => Math.round(soilIndex.value?.value ?? 72))
const organicMatter = computed(() => (soilIndex.value?.organicMatter ?? 45.8).toFixed(1))
const waterContent = computed(() => (soilIndex.value?.waterContent ?? 32.5).toFixed(1))
const riskCount = computed(() => zones.value.length)
const uncertainty = computed(() => Math.round(soilIndex.value?.uncertainty ?? 3))
const confidenceText = computed(() => soilIndex.value?.confidenceText ?? '高')
const confidencePct = computed(() => Math.round(soilIndex.value?.confidencePct ?? 85))
const topRiskZones = computed(() => zones.value.slice(0, 3))
const topFactors = computed(() => factors.value.slice(0, 4))
const highRiskCount = computed(() => zones.value.filter((zone) => zone.riskLevel !== 'low').length)
const showWarningOverlay = ref(true)
const activeZoneId = ref<number | null>(null)
const activeZone = computed(() => zones.value.find((zone) => zone.id === activeZoneId.value) ?? null)

let map: any = null
const layerInstances = new Map<string, any>()
const handleMapClick = () => {
  activeZoneId.value = null
}

const ensureLayer = (layerConfig: any) => {
  if (!map) return

  const existed = layerInstances.get(layerConfig.id)
  if (existed) {
    existed.setVisible(layerConfig.visible)
    if (typeof layerConfig.opacity === 'number') {
      existed.setOpacity(layerConfig.opacity / 100)
    }
    return
  }

  const layer = addRemoteSensingImage(
    map,
    layerConfig.url,
    imageExtent,
    typeof layerConfig.opacity === 'number' ? layerConfig.opacity / 100 : 1,
  )
  layer.setVisible(layerConfig.visible)
  layerInstances.set(layerConfig.id, layer)
}

const handleLayerToggle = (layerConfig: any, checked: boolean) => {
  layerConfig.visible = checked
  updateVisibility(layerConfig.id, checked)
  ensureLayer(layerConfig)
}

const handleLayerOpacityChange = (layerConfig: any, opacity: number) => {
  layerConfig.opacity = opacity
  updateOpacity(layerConfig.id, opacity)
  ensureLayer(layerConfig)
}

const handleZoneClick = (zoneId: number) => {
  activeZoneId.value = activeZoneId.value === zoneId ? null : zoneId
}

const updateRiskZonePositions = () => {
  if (!map) {
    return
  }

  zones.value.forEach((zone) => {
    const [x, y] = lonLatToPixel(map, zone.lonLat[0], zone.lonLat[1])
    zone.pixelPosition = [x, y]
  })
}

onMounted(() => {
  if (mapContainer.value) {
    map = createBaseMap(mapContainer.value, [110.3, 29.2], 10)
    layers.value.forEach((layer) => ensureLayer(layer))
    map.on('moveend', updateRiskZonePositions)
    map.on('postrender', updateRiskZonePositions)
    map.on('click', handleMapClick)
    nextTick(() => updateRiskZonePositions())
  }
})

watch(mapPanelActive, () => {
  nextTick(() => {
    map?.updateSize?.()
    updateRiskZonePositions()
  })
})

onUnmounted(() => {
  layerInstances.clear()
  if (map) {
    map.un('moveend', updateRiskZonePositions)
    map.un('postrender', updateRiskZonePositions)
    map.un('click', handleMapClick)
    map.setTarget(null)
    map = null
  }
})
</script>

<style scoped lang="scss">
.home-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-primary;
}

.home-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0 calc(96px + env(safe-area-inset-bottom));
}

.map-collapse {
  margin: 0 12px;

  .panel-title {
    color: $text-primary;
    font-size: 14px;
    font-weight: 600;
  }

  :deep(.van-collapse-item__content) {
    padding: 8px 0 0;
    background: transparent;
  }
}

.map-section {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  
  .map-container {
    width: 100%;
    height: 240px;
    background: $bg-secondary;
  }
  
  .layer-btn {
    --van-button-primary-background: #00ffcc;
    --van-button-primary-border-color: #00ffcc;
    --van-button-primary-color: #10201c;
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 100;
    background: #00ffcc !important;
    color: #10201c !important;
    border-color: #00ffcc !important;
    font-weight: 700;
    box-shadow: 0 0 10px rgba(0, 255, 204, 0.35);

    &:active {
      background: #00d9b0 !important;
      border-color: #00d9b0 !important;
    }
  }

  :deep(.layer-btn.van-button--primary) {
    background: #00ffcc !important;
    border-color: #00ffcc !important;
    color: #10201c !important;
  }

  :deep(.layer-btn .van-button__text) {
    color: #10201c !important;
  }
}

.map-alert-banner {
  position: absolute;
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  z-index: 105;
  background: rgba(28, 31, 34, 0.86);
  color: $text-primary;
  border: 1px solid rgba(255, 107, 53, 0.55);
  border-radius: 14px;
  padding: 4px 10px;
  font-size: 12px;

  strong {
    color: #ff6b35;
    margin: 0 2px;
  }
}

.map-overlay {
  position: absolute;
  inset: 0;
  z-index: 104;
  pointer-events: none;
}

.risk-zone-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  width: 18px;
  height: 18px;
  z-index: 106;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid currentColor;
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.75;
    animation: risk-pulse 1.8s ease-out infinite;
  }

  &::after {
    animation-delay: 0.9s;
  }

  .risk-zone-dot {
    position: absolute;
    left: 50%;
    top: 50%;
    display: block;
    width: 12px;
    height: 12px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.9);
    background: currentColor;
    box-shadow:
      0 0 0 2px rgba(0, 0, 0, 0.28),
      0 0 10px currentColor,
      0 0 20px currentColor;
    animation: risk-blink 1.2s ease-in-out infinite;
  }

  &--high {
    color: #f56c6c;
    .risk-zone-dot {
      width: 14px;
      height: 14px;
    }
  }

  &--medium {
    color: #e6a23c;
  }

  &--low {
    color: #00ffcc;
  }

}

@keyframes risk-pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.78;
  }

  100% {
    transform: translate(-50%, -50%) scale(2.7);
    opacity: 0;
  }
}

@keyframes risk-blink {
  0%,
  100% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.28);
  }
}

.zone-info-card {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  z-index: 110;
  pointer-events: auto;
  background: rgba(28, 31, 34, 0.96);
  border: 1px solid rgba(0, 255, 204, 0.35);
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 0 14px rgba(0, 255, 204, 0.15);
  color: $text-primary;
  font-size: 12px;

  .zone-info-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .zone-info-title {
    font-size: 13px;
    font-weight: 700;
    color: #00ffcc;
  }

  .zone-close {
    font-size: 16px;
    color: #aab0b7;
  }

  .zone-info-row {
    color: $text-primary;
    margin-bottom: 3px;
    line-height: 1.4;
  }

  .zone-info-hint {
    margin-top: 4px;
    color: #aab0b7;
    line-height: 1.4;
  }
}

.data-card {
  padding: 12px;
  background: transparent;

  .mt-card {
    margin-top: 12px;
  }

  .confidence-text {
    color: $primary-color;
    font-weight: 600;
  }

  .confidence-wrap {
    width: 100%;
    margin-top: 8px;
  }

}

.factor-card {
  background: $bg-secondary;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  overflow: hidden;
  padding: 0;

  .factor-title {
    color: $text-primary;
    font-weight: 700;
    font-size: 14px;
    margin: 0;
    padding: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .factor-row {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

    &:last-child {
      border-bottom: none;
    }
  }

  .factor-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .factor-name {
    color: $text-primary;
    font-size: 13px;
    font-weight: 500;
  }

  .factor-pct {
    color: $primary-color;
    font-size: 13px;
    font-weight: 600;
  }

  .factor-bar-bg {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .factor-bar-fg {
    height: 100%;
    border-radius: 999px;
    box-shadow: 0 0 8px rgba(0, 255, 204, 0.4);
  }

  .factor-hint {
    color: #aab0b7;
    font-size: 12px;
    line-height: 1.4;
  }

  .overview-row {
    .factor-head {
      margin-bottom: 0;
    }
  }

  .confidence-row {
    .factor-head {
      margin-bottom: 0;
    }

    .confidence-wrap {
      width: 100%;
    }
  }
}

.layer-popup {
  padding: 20px;

  .layer-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .layer-row {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 10px;
  }

  .layer-row-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .layer-name {
    color: $text-primary;
    font-size: 13px;
    font-weight: 600;
  }

  .layer-row-bottom {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .opacity-text {
    color: $text-secondary;
    font-size: 12px;
    min-width: 72px;
  }

  .layer-controls {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .opacity-slider {
    --van-slider-bar-height: 4px;
    --van-slider-button-width: 14px;
    --van-slider-button-height: 14px;
    --van-slider-active-background: #00ffcc;
    --van-slider-inactive-background: rgba(255, 255, 255, 0.2);
    width: 100%;
  }

  :deep(.van-switch--on) {
    background: #00ffcc;
  }
  
  h3 {
    margin: 0 0 20px;
    color: $text-primary;
  }
}
</style>
