import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import terser from "@rollup/plugin-terser";
import sitemap from "@astrojs/sitemap";
import pagefind from "astro-pagefind";
import tailwind from "@astrojs/tailwind";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from 'rehype-external-links';
import playformCompress from "@playform/compress";

import swup from "@swup/astro";
import SwupScrollPlugin from "@swup/scroll-plugin";
import SwupParallelPlugin from "@swup/parallel-plugin";

import { remarkWordCount } from './src/plugins/remark-word-count.mjs';
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
  site: "https://frosti.saroprock.com",
  style: {
    scss: {
      includePaths: ["./src/styles"],
    },
  },
  integrations: [
    mdx(),
    icon(),
    swup({
      plugins: [new SwupScrollPlugin(), new SwupParallelPlugin()],
      containers: ["#swup"],
    }),
    terser({
      compress: true,
      mangle: true,
    }),
    sitemap(),
    tailwind(),
    pagefind(),
    playformCompress(),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      transformers: [
        {
          preprocess(code, { lang }) {
            this.lang = lang;
            return code;
          },
          root(node) {
            if (node.tagName === "pre") {
              node.tagName = "figure";
              node.properties.className = ["highlight", this.lang];
            }
          },
          pre(node) {
            const toolsDiv = {
              type: "element",
              tagName: "div",
              properties: { className: ["highlight-tools"] },
              children: [
                {
                  type: "element",
                  tagName: "div",
                  properties: { className: ["code-lang"] },
                  children: [{ type: "text", value: this.lang.toUpperCase() }],
                },
              ],
            };
            const lineNumberCode = {
              type: "element",
              tagName: "code",
              children: [],
            };
            const lineNumberPre = {
              type: "element",
              tagName: "pre",
              properties: { className: ["frosti-code", "gutter"] },
              children: [lineNumberCode],
            };
            const codeContentPre = {
              type: "element",
              tagName: "pre",
              properties: { className: ["frosti-code", "code"] },
              children: [],
            };
            node.children.forEach((lineNode, index, count) => {
              count = 0;
              lineNode.children.forEach(() => {
                if (count & (1 === 1)) {
                  lineNumberCode.children.push({
                    type: "element",
                    tagName: "div",
                    properties: { className: ["line"] },
                    children: [{ type: "text", value: String(index + 1) }],
                  });
                  index++;
                }
                count++;
              });

              codeContentPre.children.push(lineNode);
            });
            const table = {
              type: "element",
              tagName: "div",
              properties: { className: ["highlight-code"] },
              children: [lineNumberPre, codeContentPre],
            };
            return {
              type: "element",
              tagName: "figure",
              properties: { className: ["highlight", this.lang] },
              children: [toolsDiv, table],
            };
          },
        },
      ],
    },
    remarkPlugins: [remarkMath, remarkWordCount, remarkReadingTime],
    rehypePlugins: [rehypeKatex,
      [
        rehypeExternalLinks,
        {
          content: {
            type: 'element',
            tagName: 'svg',
            properties: {
              width: '1em',
              height: '1em',
              viewBox: '0 0 24 24',
              fill: 'none',
              xmlns: 'http://www.w3.org/2000/svg'
            },
            children: [
              {
                type: 'element',
                tagName: 'g',
                properties: {
                  id: 'SVGRepo_bgCarrier',
                  'stroke-width': '0'
                },
                children: []
              },
              {
                type: 'element',
                tagName: 'g',
                properties: {
                  id: 'SVGRepo_tracerCarrier',
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round'
                },
                children: []
              },
              {
                type: 'element',
                tagName: 'g',
                properties: {
                  id: 'SVGRepo_iconCarrier'
                },
                children: [
                  {
                    type: 'element',
                    tagName: 'g',
                    properties: {
                      id: 'SVGRepo_iconCarrier'
                    },
                    children: [
                      {
                        type: 'element',
                        tagName: 'path',
                        properties: {
                          d: 'M10.0002 5H8.2002C7.08009 5 6.51962 5 6.0918 5.21799C5.71547 5.40973 5.40973 5.71547 5.21799 6.0918C5 6.51962 5 7.08009 5 8.2002V15.8002C5 16.9203 5 17.4801 5.21799 17.9079C5.40973 18.2842 5.71547 18.5905 6.0918 18.7822C6.5192 19 7.07899 19 8.19691 19H15.8031C16.921 19 17.48 19 17.9074 18.7822C18.2837 18.5905 18.5905 18.2839 18.7822 17.9076C19 17.4802 19 16.921 19 15.8031V14M20 9V4M20 4H15M20 4L13 11',
                          stroke: '#888',
                          'stroke-width': '2',
                          'stroke-linecap': 'round',
                          'stroke-linejoin': 'round'
                        },
                        children: []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ]],
  },
});
