import type { ShikiTransformer } from "shiki";

interface ShikiTransformerContextMeta {
  lang: string;
}
export const codeTransformer: ShikiTransformer = {
  preprocess(code, options) {
    // 保存语言信息
    this.meta = { lang: options.lang || "plaintext" };
    return code;
  },
  pre(node) {
    const language = (this.meta as ShikiTransformerContextMeta)?.lang || "plaintext";

    return {
      type: "element",
      tagName: "div",
      properties: {
        class: "frosti-code",
      },
      children: [
        // 工具栏（sticky 布局）
        {
          type: "element",
          tagName: "div",
          properties: {
            class: "frosti-code-toolbar",
          },
          children: [
            {
              type: "element",
              tagName: "span",
              properties: {
                class: "text-sm",
              },
              children: [{ type: "text", value: language }],
            },
            {
              type: "element",
              tagName: "button",
              properties: {
                "class": "btn-copy",
                "aria-label": "Copy code",
                "type": "button",
              },
              children: [
                {
                  type: "element",
                  tagName: "span",
                  properties: { class: "text-sm" },
                  children: [{ type: "text", value: "Copy" }],
                },
              ],
            },
          ],
        },
        // 代码内容
        {
          ...node,
          properties: {
            ...node.properties,
            class: "frosti-code-content",
          },
          children: [
            {
              type: "element",
              tagName: "code",
              properties: {
                class: "grid [&>.line]:px-4",
                style: "counter-reset: line",
              },
              children: node.children,
            },
          ],
        },
      ],
    };
  },
  line(node) {
    return {
      ...node,
      properties: {
        ...node.properties,
        class: "line before:content-[counter(line)] before:mr-4 before:inline-block before:w-4 before:text-right",
        style: "counter-increment: line",
      },
    };
  },
  code(node) {
    // 移除默认背景色
    delete node.properties.style;
    return node;
  },
};
