/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly DEV: boolean
    readonly PROD: boolean
    readonly SSR: boolean
    readonly VITE_API_BASE?: string
    readonly VITE_MINIO_BASE?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}