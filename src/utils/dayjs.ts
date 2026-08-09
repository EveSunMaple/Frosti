import { SITE_LANGUAGE } from "@config";
import dayjs from "dayjs";

const localeLoaders: Record<string, () => Promise<unknown>> = {
  en: () => import("dayjs/locale/en"),
  fr: () => import("dayjs/locale/fr"),
  zh: () => import("dayjs/locale/zh"),
  ja: () => import("dayjs/locale/ja"),
  ko: () => import("dayjs/locale/ko"),
  es: () => import("dayjs/locale/es"),
  de: () => import("dayjs/locale/de"),
  ru: () => import("dayjs/locale/ru"),
  pt: () => import("dayjs/locale/pt"),
  it: () => import("dayjs/locale/it"),
};

await localeLoaders[SITE_LANGUAGE]?.();
dayjs.locale(SITE_LANGUAGE);

// Export the configured dayjs
export default dayjs;
