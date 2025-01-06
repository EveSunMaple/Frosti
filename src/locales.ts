import type { Callback, TFunction } from "i18next";
import { USER_SITE } from "@/consts";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

async function initI18n() {
  if (i18next.isInitialized) {
    return;
  }
  await i18next
    .use(HttpApi)
    .use(LanguageDetector)
    .init({
      fallbackLng: "en",
      supportedLngs: ["zh", "en"],
      detection: {
        order: ["querystring", "cookie", "localStorage", "navigator"],
        caches: ["cookie"],
      },
      backend: {
        loadPath: `${USER_SITE}/locales/{{lng}}/translation.json`,
      },
    });
}

initI18n();

export async function changeLanguageTo(lng: string, callback?: Callback): Promise<TFunction> {
  return i18next.changeLanguage(lng, callback);
}

export function t(key: string, options?: any): string {
  const result = i18next.t(key, options);

  if (typeof result !== "string") {
    console.warn(`Warning: i18next translation for key '${key}' did not return a string.`);
    return String(result);
  }

  return result;
}

export { i18next };
