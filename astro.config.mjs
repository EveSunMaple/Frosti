import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import playformCompress from "@playform/compress";
import pagefind from "astro-pagefind";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: 'https://www.saroprock.com',
  style: {
    scss: {
      includePaths: ['./src/styles']
    }
  },
  integrations: [mdx(), icon(), sitemap(), tailwind(), playformCompress(), pagefind()],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  },
});