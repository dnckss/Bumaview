/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // 다른 환경 변수들...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
