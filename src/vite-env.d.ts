/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_API_SECRET: string
  readonly VITE_API_BASE_URL: string
  readonly more: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}