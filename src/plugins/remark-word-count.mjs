import { toString } from 'mdast-util-to-string';

export function remarkWordCount() {
    return function (tree, { data }) {
        const textOnPage = toString(tree);
        const wordCount = textOnPage.split(/\s+/).filter(Boolean).length;
        data.astro.frontmatter.wordCount = wordCount;
    };
}
