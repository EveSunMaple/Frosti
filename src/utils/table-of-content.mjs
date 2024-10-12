import { codeToHtml } from "shiki";

export async function highlightCode(block) {
    const code = block.rich_text.map((text) => text.plain_text).join("\n"); // 输入代码片段

    const html = await codeToHtml(code, {
        lang: block.language,
        theme: "vitesse-dark",
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
                        properties: { className: ["astro-code", "gutter"] },
                        children: [lineNumberCode],
                    };
                    const codeContentPre = {
                        type: "element",
                        tagName: "pre",
                        properties: { className: ["astro-code", "code"] },
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
    });

    return html;
}
