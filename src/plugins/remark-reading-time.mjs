import { toString } from 'mdast-util-to-string';

const wordsPerMinute = 200;
const chineseCharactersPerMinute = 300;
const linesPerMinute = 50; // 假设每分钟可以阅读50行代码

export function remarkReadingTime() {
    return function (tree, { data }) {
        const textOnPage = toString(tree);
        const wordCount = textOnPage.split(/\s+/).filter(Boolean).length;
        const chineseCount = textOnPage.match(/[\u4e00-\u9fa5]/g)?.length || 0;
        const lineCount = textOnPage.split(/\r?\n/).length; // 计算代码行数

        // 计算阅读时间（分钟）
        const readingTime = (wordCount / wordsPerMinute) + (chineseCount / chineseCharactersPerMinute) + (lineCount / linesPerMinute);

        // 将阅读时间添加到 frontmatter 中
        data.astro.frontmatter.totalCharCount = wordCount + chineseCount;
        data.astro.frontmatter.readingTime = Math.ceil(readingTime);
    };
}
