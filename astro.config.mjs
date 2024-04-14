import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.saroprock.com',
	integrations: [mdx(), sitemap(), tailwind()],
	markdown: {
	  remarkPlugins: [remarkMath],
	  rehypePlugins: [rehypeKatex]
	},
});
