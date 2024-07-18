import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import playformCompress from "@playform/compress";
import pagefind from "astro-pagefind";

// https://astro.build/config
export default defineConfig({
  site: 'https://www.saroprock.com',
  style: {
    shikiConfig: {
      themes: {
        light: 'github-dark',
        dark: 'github-dark',
      },
    },
    scss: {
      includePaths: ['./src/styles']
    }
  },
  integrations: [mdx(), sitemap(), tailwind(), playformCompress(), pagefind()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  },
});