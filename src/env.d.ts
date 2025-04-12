/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMeta {
  env: {
    PROD: boolean;
    DEV: boolean;
  };
}

declare module "dayjs" {
  interface Dayjs {
    format: (template?: string) => string;
    locale: {
      (): string;
      (preset: string, object?: Partial<ILocale>): Dayjs;
    };
  }

  interface ILocale {
    name: string;
    weekdays?: string[];
    months?: string[];
    [key: string]: any;
  }

  export default function dayjs(date?: any): Dayjs;
  namespace dayjs {
    export const locale: (preset: string | ILocale, object?: Partial<ILocale>, isLocal?: boolean) => string;
  }
}

declare module "dayjs/locale/*" {
  const locale: any;
  export default locale;
}
