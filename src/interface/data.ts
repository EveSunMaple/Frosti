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

export interface PostData {
  detail: boolean;
  title: string;
  description: string;
  image?: string;
  pubDate?: Date;
  badge?: string;
  categories?: string[];
  tags?: string[];
  word?: string;
  time?: string;
  url: string;
}
