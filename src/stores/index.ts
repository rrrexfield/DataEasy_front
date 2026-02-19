import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出所有 store
export { useMapStore } from './map'
export { useDataStore } from './data'
export { useAIStore } from './ai'
