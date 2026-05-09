/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WP_URL: string;
  readonly VITE_COMING_SOON_UNTIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
