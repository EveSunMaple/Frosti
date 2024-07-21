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
}
