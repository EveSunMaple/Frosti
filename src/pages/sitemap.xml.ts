import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "@config";
import { getCollection } from "astro:content";

export async function GET(context: any) {
  const posts = await getCollection("blog");
  const sortedPosts = posts.sort((a: any, b: any) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: sortedPosts.map((blog: any) => ({
      ...blog.data,
      link: `/blog/${blog.slug}/`,
    })),
  });
}
