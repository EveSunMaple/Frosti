/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly NOTION_API_KEY: string;
  readonly NOTION_SHUOSHUO_PAGE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
