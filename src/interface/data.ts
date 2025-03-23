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
  title: string;
  description?: string;
  image?: string;
  pubDate?: Date;
  badge?: string;
  categories?: string[];
  tags?: string[];
  word?: string;
  time?: string;
  url?: string;
}

// ===== Header Components =====
export interface HeaderProps {
  title: string;
  description: string;
  favicon: string;
  image?: string;
}

// ===== Widget Components =====
export interface ThemeToggleProps {
  className?: string;
}

export interface PaginationProps {
  page: Page;
  totalPages: number;
  pageLinks: {
    active: (string | number)[];
    hidden: (string | number)[];
  };
  baseUrl: string;
}

export interface PaginationNumberProps {
  number: string | number;
  current: number;
  baseUrl: string;
  isActive?: boolean;
  isOnly?: boolean;
}

export interface PaginationArrowProps {
  url: string | undefined;
  direction: "prev" | "next";
  label: string;
}

export interface PaginationDropdownProps {
  hiddenPages: (string | number)[];
  current: number;
  baseUrl: string;
}

// ===== Temple Components =====
export interface CardProps {
  class?: string;
}

export interface CardGroupProps {
  class?: string;
  gap?: string;
  cols?: string;
}

// ===== Sidebar Components =====
export interface TOCBarProps {
  headings?: Heading[];
  showTOC?: boolean;
}

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

// ===== MDX Components =====
export interface AlertBaseProps {
  type: "info" | "success" | "warning" | "error";
  icon: string;
}

export interface LinkCardProps {
  title: string;
  desc: string;
  url: string;
  img?: string;
  badge?: string;
  target?: string;
  icon?: string;
  categories?: string[];
}

export interface RepositoryCardProps {
  owner: string;
  repo: string;
  description?: string;
  showStats?: boolean;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: string;
  iconColor?: string;
  link?: string;
}

export interface GitHubStatsProps {
  username: string;
  showPrivate?: boolean;
  showIcons?: boolean;
  count?: number;
  theme?: string;
  layout?: "default" | "compact";
}

export interface TimelineItem {
  title: string;
  date: string;
  description?: string;
  icon?: string;
}

export interface MainCardProps extends PostData {
  className?: string;
  style?: string;
}

export interface FriendCardProps {
  name: string;
  avatar: string;
  description: string;
  url: string;
  type?: string;
}
