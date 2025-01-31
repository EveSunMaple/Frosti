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

export interface Config {
  site: SiteConfig;
  user: UserConfig;
}
