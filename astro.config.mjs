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
      transformers: [
        {
          preprocess(code, { lang }) {
            this.lang = lang;
            return code;
          },
          root(node) {
            if (node.tagName === 'pre') {
              node.tagName = 'figure';
              node.properties.className = ['highlight', this.lang];
            }
          },
          pre(node) {
            const toolsDiv = {
              type: 'element',
              tagName: 'div',
              properties: { className: ['highlight-tools'] },
              children: [
                {
                  type: 'element',
                  tagName: 'div',
                  properties: { className: ['code-lang'] },
                  children: [{ type: 'text', value: this.lang.toUpperCase() }],
                },
              ],
            };
            const lineNumberCode = {
              type: 'element',
              tagName: 'code',
              children: [],
            };
            const lineNumberPre = {
              type: 'element',
              tagName: 'pre',
              properties: { className: ['frosti-code', 'gutter'] },
              children: [lineNumberCode],
            };
            const codeContentPre = {
              type: 'element',
              tagName: 'pre',
              properties: { className: ['frosti-code', 'code'] },
              children: [],
            };
            node.children.forEach((lineNode, index, count) => {
              count = 0;
              lineNode.children.forEach(() => {
                if (count & 1 === 1) {
                  lineNumberCode.children.push({
                    type: 'element',
                    tagName: 'div',
                    properties: { className: ['line'] },
                    children: [{ type: 'text', value: String(index + 1) }],
                  });
                  index++;
                }
                count++;
              });

              codeContentPre.children.push(lineNode);
            });
            const table = {
              type: 'element',
              tagName: 'div',
              properties: { className: ['highlight-code'] },
              children: [lineNumberPre, codeContentPre],
            };
            return {
              type: 'element',
              tagName: 'figure',
              properties: { className: ['highlight', this.lang] },
              children: [toolsDiv, table],
            };
          },
        },
      ],
    },
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  },
});