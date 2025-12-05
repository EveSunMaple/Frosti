import type { Root } from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Plugin } from "unified";
import type { VFile } from "vfile";

const wordsPerMinute = 200;
const chineseCharactersPerMinute = 300;
const linesPerMinute = 50;

interface AstroVFile extends VFile {
  data: {
    astro: {
      frontmatter: {
        totalCharCount: number;
        readingTime: number;
        [key: string]: any;
      };
    };
  };
}

export const remarkReadingTime: Plugin<[], Root> = () => {
  return (tree: Root, file: VFile): void => {
    const astroFile = file as AstroVFile;
    const textOnPage = mdastToString(tree);

    const wordCount = textOnPage.split(/\s+/).filter(Boolean).length;
    const chineseCount = textOnPage.match(/[\u4E00-\u9FA5]/g)?.length || 0;
    const lineCount = textOnPage.split(/\r?\n/).length;

    const readingTime =
      wordCount / wordsPerMinute +
      chineseCount / chineseCharactersPerMinute +
      lineCount / linesPerMinute;

    astroFile.data.astro.frontmatter.totalCharCount = wordCount + chineseCount;
    astroFile.data.astro.frontmatter.readingTime = Math.ceil(readingTime);
  };
};
