import type { Config } from "@interfaces/site";
import * as fs from "node:fs";
import * as path from "node:path";
import yaml from "js-yaml";

// 配置文件路径
const configPath = path.resolve("frosti.config.yaml");
// 翻译文件路径
const translationsPath = path.resolve("src/i18n/translations.yaml");
// 读取并解析 YAML 文件
const config = yaml.load(fs.readFileSync(configPath, "utf8")) as Config;
// 读取并解析翻译文件
const translationsConfig = yaml.load(fs.readFileSync(translationsPath, "utf8")) as Record<string, any>;

// 网站基本信息
export const SITE_TAB = config.site.tab;
export const SITE_TITLE = config.site.title;
export const SITE_DESCRIPTION = config.site.description;
export const SITE_LANGUAGE = config.site.language;
export const SITE_FAVICON = config.site.favicon;
export const SITE_THEME = config.site.theme;
export const DATE_FORMAT = config.site.date_format;

// 代码块的主题
export const CODE_THEME = config.site.theme.code;

// 用户个人信息
export const USER_NAME = config.user.name;
export const USER_SITE = config.user.site;
export const USER_AVATAR = config.user.avatar;

// 社交图标配置（侧边栏和页脚）
export const USER_SIDEBAR_SOCIAL_ICONS = config.user.sidebar.social;
export const USER_FOOTER_SOCIAL_ICONS = config.user.footer.social;

// 网站菜单项配置
export const SITE_MENU = config.site.menu;

// 多语言文本配置
export const TRANSLATIONS = translationsConfig;

// 获取当前语言的翻译文本的函数
export function t(key: string): string {
  const keyParts = key.split(".");
  let currentObj: any = TRANSLATIONS[SITE_LANGUAGE];

  for (const part of keyParts) {
    if (!currentObj || typeof currentObj !== "object") {
      return key;
    }
    currentObj = currentObj[part];
  }

  return typeof currentObj === "string" ? currentObj : key;
}
