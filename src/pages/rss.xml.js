import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION, SITE_LANG } from "../consts";
import { marked } from "marked";

export async function GET(context) {
  const posts = await getCollection("blog");
  const siteUrl = context.site;

  function replacePath(content, siteUrl) {
    return content.replace(/(src|img|r|l)="([^"]+)"/g, (match, attr, src) => {
      if (!src.startsWith("http") && !src.startsWith("//") && !src.startsWith("data:")) {
        return `${attr}="${new URL(src, siteUrl).toString()}"`;
      }
      return match;
    });
  }

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: siteUrl,
    language: SITE_LANG,
    generator: "Astro RSS Generator",
    items: posts.map((post) => {
      const { body, data, slug } = post;
      const content = body
        ? `<![CDATA[${replacePath(marked(body), siteUrl)}]]>`
        : "No content available.";
      return {
        title: data.title || "Untitled",
        pubDate: new Date(data.pubDate).toUTCString(),
        link: `/blog/${slug}/`,
        description: data.description || "No description provided.",
        content,
      };
    }),
  });
}
