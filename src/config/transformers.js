const createSVG = (d, className) => ({
  type: "element",
  tagName: "svg",
  properties: {
    viewBox: "0 -0.5 25 25",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: `stroke-current shrink-0 h-6 w-6 ${className}`,
  },
  children: [
    {
      type: "element",
      tagName: "path",
      properties: { d, strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" },
    },
  ],
});

const createButton = () => ({
  type: "element",
  tagName: "div",
  properties: { className: ["code-container"] },
  children: [
    {
      type: "element",
      tagName: "label",
      properties: { className: ["swap", "swap-flip", "btn", "btn-ghost", "btn-sm", "copy-btn"] },
      children: [
        { type: "element", tagName: "input", properties: { className: ["copy-checkbox"], type: "checkbox" } },
        {
          type: "element",
          tagName: "div",
          properties: { className: ["swap-on"] },
          children: [createSVG("M5.5 12.5L10.167 17L19.5 8", "")],
        },
        {
          type: "element",
          tagName: "div",
          properties: { className: ["swap-off"] },
          children: [createSVG("M17.676 14.248C17.676 15.8651 16.3651 17.176 14.748 17.176H7.428C5.81091 17.176 4.5 15.8651 4.5 14.248V6.928C4.5 5.31091 5.81091 4 7.428 4H14.748C16.3651 4 17.676 5.31091 17.676 6.928V14.248Z", "swap-off")],
        },
      ],
    },
  ],
});

const createCodeLine = (lineNumber) => ({
  type: "element",
  tagName: "div",
  properties: { className: ["line"] },
  children: [{ type: "text", value: String(lineNumber) }],
});

const transformers = [
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
          createButton(),
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

      // 填充代码内容和行号
      node.children.forEach((lineNode, index) => {
        lineNumberCode.children.push(createCodeLine(index + 1));
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
];

export { transformers };
