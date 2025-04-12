import type { CollectionEntry } from "astro:content";
import { BLOG_PAGE_SIZE } from "@config";
import { getAllPosts, getPostsWithStats, sortPostsByDate, sortPostsByPinAndDate } from "./blogUtils";

/**
 * 获取主博客页面的分页数据
 * @param paginate 分页函数
 * @returns 分页路径数据
 */
export async function getMainBlogPaginationPaths({ paginate }: { paginate: any }) {
  const allPosts = await getAllPosts();
  const sortedPosts = sortPostsByPinAndDate(allPosts);
  const postsWithStats = await getPostsWithStats(sortedPosts);

  return paginate(postsWithStats, { pageSize: BLOG_PAGE_SIZE });
}

/**
 * 获取特定标签的分页数据
 * @param paginate 分页函数
 * @returns 分页路径数据
 */
export async function getTagPaginationPaths({ paginate }: { paginate: any }) {
  const allPosts = await getAllPosts();
  const sortedPosts = sortPostsByDate(allPosts);
  const allTags = [...new Set(sortedPosts.flatMap((blog: CollectionEntry<"blog">) => blog.data.tags || []))];
  const postsWithStats = await getPostsWithStats(sortedPosts);

  return allTags.flatMap((tag) => {
    const filteredPosts = postsWithStats.filter((blog: any) => blog.data.tags?.includes(tag));
    return paginate(filteredPosts, {
      params: { tag },
      pageSize: BLOG_PAGE_SIZE,
    });
  });
}

/**
 * 获取特定分类的分页数据
 * @param paginate 分页函数
 * @returns 分页路径数据
 */
export async function getCategoryPaginationPaths({ paginate }: { paginate: any }) {
  const allPosts = await getAllPosts();
  const sortedPosts = sortPostsByDate(allPosts);
  const allCategories = [...new Set(sortedPosts.flatMap((blog: CollectionEntry<"blog">) => blog.data.categories || []))];
  const postsWithStats = await getPostsWithStats(sortedPosts);

  return allCategories.flatMap((category) => {
    const filteredPosts = postsWithStats.filter((blog: any) => blog.data.categories?.includes(category));
    return paginate(filteredPosts, {
      params: { category },
      pageSize: BLOG_PAGE_SIZE,
    });
  });
}
