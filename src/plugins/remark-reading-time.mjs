import { toString } from "mdast-util-to-string";

const wordsPerMinute = 200;
const chineseCharactersPerMinute = 300;
const linesPerMinute = 50;

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const wordCount = textOnPage.split(/\s+/).filter(Boolean).length;
    const chineseCount = textOnPage.match(/[\u4E00-\u9FA5]/g)?.length || 0;
    const lineCount = textOnPage.split(/\r?\n/).length;
    const readingTime = (wordCount / wordsPerMinute) + (chineseCount / chineseCharactersPerMinute) + (lineCount / linesPerMinute);

    data.astro.frontmatter.totalCharCount = wordCount + chineseCount;
    data.astro.frontmatter.readingTime = Math.ceil(readingTime);
  };
}
