import type { CollectionEntry } from "astro:content";
import { BLOG_PAGE_SIZE } from "@config";
import {
  getAllPosts,
  getPostsWithStats,
  sortPostsByDate,
  sortPostsByPinAndDate,
} from "./blogUtils";

async function getTaxonomyPaginationPaths({
  paginate,
  key,
}: {
  paginate: any;
  key: "tags" | "categories";
}) {
  const allPosts = await getAllPosts();
  const sortedPosts = sortPostsByDate(allPosts);
  const values = [
    ...new Set(
      sortedPosts.flatMap(
        (blog: CollectionEntry<"blog">) => blog.data[key] || [],
      ),
    ),
  ];
  const postsWithStats = await getPostsWithStats(sortedPosts);

  return values.flatMap((value) => {
    const filteredPosts = postsWithStats.filter((blog: any) =>
      blog.data[key]?.includes(value),
    );
    return paginate(filteredPosts, {
      params: key === "tags" ? { tag: value } : { category: value },
      pageSize: BLOG_PAGE_SIZE,
    });
  });
}

/**
 * 获取主博客页面的分页数据
 * @param paginate 分页函数
 * @returns 分页路径数据
 */
export async function getMainBlogPaginationPaths({
  paginate,
}: {
  paginate: any;
}) {
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
  return await getTaxonomyPaginationPaths({ paginate, key: "tags" });
}

/**
 * 获取特定分类的分页数据
 * @param paginate 分页函数
 * @returns 分页路径数据
 */
export async function getCategoryPaginationPaths({
  paginate,
}: {
  paginate: any;
}) {
  return await getTaxonomyPaginationPaths({ paginate, key: "categories" });
}
