import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { unified } from "@astrojs/markdown-remark";
import playformCompress from "@playform/compress";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import { CODE_THEME, USER_SITE } from "./src/config.ts";

import updateConfig from "./src/integration/updateConfig.ts";

import { remarkReadingTime } from "./src/plugins/remark-reading-time";

// https://astro.build/config
export default defineConfig({
  site: USER_SITE,
  output: "static",
  style: {
    scss: {
      includePaths: ["./src/styles"],
    },
  },
  integrations: [updateConfig(), expressiveCode({
    themes: [CODE_THEME],
    styleOverrides: {
      borderRadius: "0.75rem",
    },
  }), mdx(), icon(), sitemap(), tailwind({
    configFile: "./tailwind.config.mjs",
  }), playformCompress()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkReadingTime],
      rehypePlugins: [
        rehypeKatex,
        [
          rehypeExternalLinks,
          {
            content: { type: "text", value: "↗" },
          },
        ],
      ],
    }),
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },
});
