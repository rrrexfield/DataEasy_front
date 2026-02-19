// Vite 环境变量类型声明
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_MAP_CENTER: string
  readonly VITE_MAP_ZOOM: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
