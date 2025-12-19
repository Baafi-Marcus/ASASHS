/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABASE_URL: string
  readonly VITE_STACK_PROJECT_ID: string
  readonly VITE_STACK_PUBLISHABLE_CLIENT_KEY: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}