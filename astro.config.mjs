import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import playformCompress from "@playform/compress";
import terser from "@rollup/plugin-terser";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import { CODE_THEME, USER_SITE } from "./src/config.ts";

import { initI18n } from "./src/locales";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: USER_SITE,
  output: "static",
  style: {
    scss: {
      includePaths: ["./src/styles"],
    },
  },
  integrations: [mdx(), icon({
    include: {
      mdi: ["*"], // (Default) Loads entire Material Design Icon set
    },
  }), terser({
    compress: true,
    mangle: true,
  }), sitemap(), tailwind(), pagefind(), playformCompress(), initI18n()],
  markdown: {
    shikiConfig: {
      theme: CODE_THEME,
    },
    remarkPlugins: [remarkMath, remarkReadingTime],
    rehypePlugins: [rehypeKatex, [
      rehypeExternalLinks,
      {
        content: { type: "text", value: "↗" },
      },
    ]],
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
