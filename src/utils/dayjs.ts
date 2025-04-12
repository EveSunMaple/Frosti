import { SITE_LANGUAGE } from "@config";
import dayjs from "dayjs";

// Import all supported locales
import "dayjs/locale/en";
import "dayjs/locale/fr";
import "dayjs/locale/zh";
import "dayjs/locale/ja";
import "dayjs/locale/ko";
import "dayjs/locale/es";
import "dayjs/locale/de";
import "dayjs/locale/ru";
import "dayjs/locale/pt";
import "dayjs/locale/it";

// Set the default locale from the site configuration
// @ts-expect-error - TypeScript
dayjs.locale(SITE_LANGUAGE);

// Export the configured dayjs
export default dayjs;
