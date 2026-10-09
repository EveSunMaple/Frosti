import lucideIcons from "@iconify-json/lucide/icons.json";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified as createMarkdownProcessor } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/postcss";
import playformCompress from "@playform/compress";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { smartLinks } from "astro-smart-links";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import rehypeParse from "rehype-parse";
import remarkMath from "remark-math";
import { unified } from "unified";

import { CODE_THEME, USER_SITE } from "./src/config.ts";

import updateConfig from "./src/integration/updateConfig.ts";

import { remarkReadingTime } from "./src/plugins/remark-reading-time";

// External link icon built from the same Iconify set astro-icon uses.
const iconParser = unified().use(rehypeParse, { fragment: true });
const externalLinkIconBody = iconParser.parse(lucideIcons.icons["external-link"].body).children;

const createExternalLinkIcon = () => ({
  type: "element",
  tagName: "svg",
  properties: {
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    viewBox: `0 0 ${lucideIcons.width} ${lucideIcons.height}`,
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: ["smart-link-icon"],
    "aria-hidden": "true",
  },
  children: structuredClone(externalLinkIconBody),
});

// https://astro.build/config
export default defineConfig({
  site: USER_SITE,
  output: "static",
  style: {
    scss: {
      includePaths: ["./src/styles"],
    },
  },
  integrations: [
    updateConfig(),
    expressiveCode({
      themes: [CODE_THEME],
      styleOverrides: {
        borderRadius: "0.75rem",
      },
    }),
    mdx(),
    icon(),
    sitemap(),
    smartLinks({
      internalLinkClass: "smart-link smart-link--internal",
      externalLinkClass: "smart-link smart-link--external",
      brokenLinkClass: "smart-link smart-link--broken",
      content: null,
      // Assets such as /rss.xml are linked from the template; treat every
      // emitted file as a valid route instead of HTML pages only.
      includeAllFiles: true,
      customExternalLinkTransform: (node, meta) => {
        node.properties.className = [...(node.properties.className || []), meta.className];
        node.properties.target = "_blank";
        node.properties.rel = "noopener noreferrer";
        node.children.push(createExternalLinkIcon());
      },
    }),
    playformCompress(),
  ],
  markdown: {
    processor: createMarkdownProcessor({
      remarkPlugins: [remarkMath, remarkReadingTime],
      rehypePlugins: [rehypeKatex],
    }),
  },
  vite: {
    css: {
      postcss: {
        plugins: [tailwindcss()],
      },
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },
});
