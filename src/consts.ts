// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

// Site title and description
export const SITE_TITLE = "Frosti 🧊"; // The title of the site
export const SITE_DESCRIPTION = "A blog template"; // A brief description of the site

// User profile information
export const USER_NAME = "EveSunMaple"; // The name of the user
export const USER_AVATAR = "/profile.webp"; // The path to the user's avatar image

// Server and transition settings
export const SERVER_URL = "https://demo.saroprock.com"; // URL of the server
export const TRANSITION_API = true; // Whether to enable the transition API

// Menu items for navigation
export const menuItems = [
  { id: "home", text: "Home", href: "/" }, // Home page
  { id: "about", text: "About", href: "/about" }, // About page
  { id: "blog", text: "Blogs", href: "/blog" }, // Blog page
  { id: "project", text: "Projects", href: "/project" }, // Projects page
  { id: "friend", text: "Friends", href: "/friend" }, // Friends page
  {
    id: "contact",
    text: "Contact",
    href: "mailto:contact.evesunmaple@outlook.com", // Contact email
    target: "_blank", // Open in a new tab
  },
];

// Social media and contact icons
export const socialIcons = [
  {
    href: "https://afdian.net/a/saroprock",
    ariaLabel: "Support my work",
    title: "Support my work",
    svg: "support",
  },
  {
    href: "https://github.com/EveSunMaple",
    ariaLabel: "Github",
    title: "Github",
    svg: "github",
  },
  {
    href: "https://space.bilibili.com/438392347",
    ariaLabel: "BiliBili",
    title: "BiliBili",
    svg: "bilibili",
  },
  {
    href: "https://www.zhihu.com/people/sunmaple-20",
    ariaLabel: "知乎",
    title: "知乎",
    svg: "zhihu",
  },
  {
    href: "/rss.xml",
    ariaLabel: "RSS Feed",
    title: "RSS Feed",
    svg: "rss",
  },
];
