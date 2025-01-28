import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_DESCRIPTION, SITE_TITLE } from "../config";

export async function GET(context: any) {
  const posts = await getCollection("post");
  const sortedPosts = posts.sort((a: any, b: any) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: sortedPosts.map((post: any) => ({
      ...post.data,
      link: `/blog/${post.slug}/`,
    })),
  });
}
