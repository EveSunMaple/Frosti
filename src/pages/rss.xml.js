import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION, RSS_FULL_TEXT } from "../consts";
import { marked } from "marked";


export async function GET(context) {
  const posts = await getCollection("blog");
  const items = posts.map((post) => {
    const { body, data, slug } = post;
    return {
      ...data,
      link: `/blog/${slug}/`,
      ...(RSS_FULL_TEXT && { content: marked(body) }),
    };
  });

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items,
  });
}