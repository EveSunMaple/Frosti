export interface Post {
  [x: string]: any;
  data: {
    [x: string]: any;
    title: string;
    image: string;
    description: string;
    pubDate: Date;
    badge: string;
    categories: string[];
    tags: string[];
  };
  remarkPluginFrontmatter: {
    totalCharCount: string;
    readingTime: string;
  };
  slug: string;
}

export interface Page {
  url: {
    prev?: string;
    next?: string;
  };
  data: Post[];
  total: number;
  size: number;
  current: number;
}

export interface CardInfo {
  title: string;
  image?: string;
  pubDate?: Date;
  badge?: string;
  categories?: string[];
  tags?: string[];
  word?: string;
  time?: string;
  isBlog: boolean;
  comment?: boolean;
  url?: string;
}

export interface EnvelopeInfo {
  title: string;
  desc: string;
  image?: string;
  pubDate?: Date;
  badge?: string;
  categories?: string[];
  tags?: string[];
  word?: string;
  time?: string;
  isBlog: boolean;
  url: string;
}
export interface MenuItem {
  id?: string;
  text: string;
  svg: string;
  href?: string;
  target?: string;
  subItems?: MenuItem[];
}

export interface SocialIcon {
  href: string;
  svg: string;
  ariaLabel: string;
  title: string;
}
