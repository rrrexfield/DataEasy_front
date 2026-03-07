import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
  const center = ref<[number, number]>([110.3, 29.2])
  const zoom = ref(10)
  const selectedDataId = ref('')
  
  const setCenter = (newCenter: [number, number]) => {
    center.value = newCenter
  }
  
  const setZoom = (newZoom: number) => {
    zoom.value = newZoom
  }
  
  const setSelectedData = (id: string) => {
    selectedDataId.value = id
  }
  
  return {
    center,
    zoom,
    selectedDataId,
    setCenter,
    setZoom,
    setSelectedData,
  }
})
