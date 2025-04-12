export interface SubMenuItem {
  id: string;
  text: string;
  href: string;
  svg: string;
  target: string;
}

export interface MenuItem {
  id: string;
  text: string;
  href: string;
  svg: string;
  target: string;
  subItems?: SubMenuItem[];
}

export interface SocialIcon {
  href: string;
  ariaLabel: string;
  title: string;
  svg: string;
}

export interface BlogConfig {
  pageSize: number;
}

export interface SiteConfig {
  tab: string;
  title: string;
  description: string;
  language: string;
  favicon: string;
  theme: {
    light: string;
    dark: string;
    code: string;
  };
  date_format: string;
  blog: BlogConfig;
  menu: MenuItem[];
}

export interface UserConfig {
  name: string;
  site: string;
  avatar: string;
  sidebar: {
    social: SocialIcon[];
  };
  footer: {
    social: SocialIcon[];
  };
}

export interface TranslationLabel {
  noTag: string;
  tagCard: string;
  tagPage: string;
  totalTags: string;
  noCategory: string;
  categoryCard: string;
  categoryPage: string;
  totalCategories: string;
  noPosts: string;
  archivePage: string;
  totalPosts: string;
  link: string;
  prevPage: string;
  nextPage: string;
  wordCount: string;
  readTime: string;
  share: string;
  shareCard: string;
  close: string;
  learnMore: string;
  allTags: string;
  allCategories: string;
  post: string;
  posts: string;
  tagDescription: string;
  categoryDescription: string;
  tagsPageDescription: string;
  categoriesPageDescription: string;
  archivesPageDescription: string;
  backToBlog: string;
}

export interface LanguageTranslation {
  label: TranslationLabel;
}

export interface Translations {
  [language: string]: LanguageTranslation;
}

export interface Config {
  site: SiteConfig;
  user: UserConfig;
}
