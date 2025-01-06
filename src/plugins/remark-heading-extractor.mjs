import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

export function remarkHeadingExtractor() {
  return function (tree, { data }) {
    const headings = [];

    visit(tree, "heading", (node) => {
      const rawText = toString(node);

      const text = rawText.split("\n")[0].replace(/<[^>]*>/g, "").trim();
      const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") + rawText.split("\n")[0].match(/href="([^"]+)"/, "")[1].trim();

      const level = node.depth;

      headings.push({ id, text, level });
    });

    // 将标题信息存储到 frontmatter 中
    data.astro.frontmatter.headings = headings;
  };
}
