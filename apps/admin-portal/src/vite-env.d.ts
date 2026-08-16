/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WEDDING_WEBSITE_URL: string;
  /** Feature flag — set to "false" to hide the Vendors tab and vendor picker. Shown by default
   * when unset, so leaving it out of an environment's config is the same as "on". */
  readonly VITE_ENABLE_VENDORS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
