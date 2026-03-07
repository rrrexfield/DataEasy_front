import { defineStore } from 'pinia'
import type { MapLayer } from '@/types'

interface MapState {
  center: [number, number]
  zoom: number
  layers: MapLayer[]
  selectedLayer: string | null
  isLoading: boolean
}

export const useMapStore = defineStore('map', {
  state: (): MapState => ({
    center: [116.3, 39.9],
    zoom: 10,
    layers: [
      {
        id: 'base',
        name: '底图',
        visible: true,
        opacity: 1,
        type: 'base',
      },
    ],
    selectedLayer: null,
    isLoading: false,
  }),

  getters: {
    visibleLayers: state => state.layers.filter(layer => layer.visible),
    currentLayer: state => state.layers.find(layer => layer.id === state.selectedLayer),
  },

  actions: {
    setCenter(center: [number, number]) {
      this.center = center
    },

    setZoom(zoom: number) {
      this.zoom = zoom
    },

    addLayer(layer: MapLayer) {
      this.layers.push(layer)
    },

    removeLayer(layerId: string) {
      const index = this.layers.findIndex(layer => layer.id === layerId)
      if (index > -1) {
        this.layers.splice(index, 1)
      }
    },

    toggleLayerVisibility(layerId: string) {
      const layer = this.layers.find(l => l.id === layerId)
      if (layer) {
        layer.visible = !layer.visible
      }
    },

    setLayerOpacity(layerId: string, opacity: number) {
      const layer = this.layers.find(l => l.id === layerId)
      if (layer) {
        layer.opacity = opacity
      }
    },

    selectLayer(layerId: string | null) {
      this.selectedLayer = layerId
    },

    setLoading(isLoading: boolean) {
      this.isLoading = isLoading
    },
  },
})
