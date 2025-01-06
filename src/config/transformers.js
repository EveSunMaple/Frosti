export const transformers = [
  {
    preprocess(code, { lang }) {
      this.lang = lang;
      return code;
    },
    root(node) {
      if (node.tagName === "pre") {
        node.tagName = "figure";
        node.properties.className = ["highlight", "fade-in-up", this.lang];
      }
    },
    pre(node) {
      const uniqueId = crypto.randomUUID();
      // 复制按钮 HTML
      const copyButtonHTML = {
        type: "element",
        tagName: "div",
        properties: { className: ["code-container"] },
        children: [
          {
            type: "element",
            tagName: "label",
            properties: {
              "className": [
                "swap",
                "swap-flip",
                "btn",
                "btn-ghost",
                "btn-sm",
                "copy-btn",
              ],
              "for": uniqueId, // 关联控件
              "aria-label": "Copy to clipboard",
            },
            children: [
              {
                type: "element",
                tagName: "span",
                properties: { className: ["sr-only"] },
                children: [
                  {
                    type: "text",
                    value: "Copy to clipboard",
                  },
                ],
              },
              {
                type: "element",
                tagName: "input",
                properties: {
                  className: ["copy-checkbox"],
                  type: "checkbox",
                  id: uniqueId, // 使用唯一的 id
                },
              },
              {
                type: "element",
                tagName: "div",
                properties: { className: ["swap-on"] },
                children: [
                  {
                    type: "element",
                    tagName: "svg",
                    properties: {
                      viewBox: "0 -0.5 25 25",
                      fill: "none",
                      xmlns: "http://www.w3.org/2000/svg",
                      className: "stroke-current shrink-0 h-6 w-6",
                    },
                    children: [
                      {
                        type: "element",
                        tagName: "path",
                        properties: {
                          d: "M5.5 12.5L10.167 17L19.5 8",
                          strokeWidth: "1.5",
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                type: "element",
                tagName: "div",
                properties: { className: ["swap-off"] },
                children: [
                  {
                    type: "element",
                    tagName: "svg",
                    properties: {
                      viewBox: "0 -0.5 25 25",
                      fill: "none",
                      xmlns: "http://www.w3.org/2000/svg",
                      className: "stroke-current shrink-0 h-6 w-6",
                    },
                    children: [
                      {
                        type: "element",
                        tagName: "path",
                        properties: {
                          fillRule: "evenodd",
                          clipRule: "evenodd",
                          d: "M17.676 14.248C17.676 15.8651 16.3651 17.176 14.748 17.176H7.428C5.81091 17.176 4.5 15.8651 4.5 14.248V6.928C4.5 5.31091 5.81091 4 7.428 4H14.748C16.3651 4 17.676 5.31091 17.676 6.928V14.248Z",
                          strokeWidth: "1.5",
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                        },
                      },
                      {
                        type: "element",
                        tagName: "path",
                        properties: {
                          d: "M10.252 20H17.572C19.1891 20 20.5 18.689 20.5 17.072V9.75195",
                          strokeWidth: "1.5",
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      // 生成工具栏（包含代码语言标签）
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

      // 生成行号和代码内容结构
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

      // 填充代码内容和行号
      node.children.forEach((lineNode, index) => {
        let count = 0;
        lineNode.children.forEach(() => {
          if (count % 2 === 1) {
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
        toolsDiv.children.push(copyButtonHTML); // 为每个代码框生成唯一的复制按钮
      });

      // 生成最终的代码块结构
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
];
