import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/blog",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updated: z.coerce.date().optional(),
    image: z.string().optional(),
    badge: z.string().optional(),
    draft: z.boolean().default(false),
    categories: z
      .array(z.string())
      .refine((items: string[]) => new Set(items).size === items.length, {
        message: "categories must be unique",
      })
      .optional(),
    tags: z
      .array(z.string())
      .refine((items: string[]) => new Set(items).size === items.length, {
        message: "tags must be unique",
      })
      .optional(),
  }),
});

export const collections = { blog };
