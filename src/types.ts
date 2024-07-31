export interface Post {
  data: {
    title: string;
    image: string;
    description: string;
    pubDate: Date;
    badge: string;
    tags: string[];
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
  current: string;
}

export interface CardInfo {
  title: string;
  image?: string;
  pubDate?: Date;
  badge?: string;
  tags?: string[];
  isBlog: boolean;
  url?: string;
}

export interface EnvelopeInfo {
  title: string;
  desc: string;
  image?: string;
  pubDate?: Date;
  badge?: string;
  tags?: string[];
  isBlog: boolean;
  url: string;
}
