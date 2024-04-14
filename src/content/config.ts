import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updated: z.coerce.date().optional(),
		image: z.string().optional(),
		badge: z.string().optional(),
		tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
			message: 'tags must be unique',
		}).optional(),
	}),
});

export const collections = { blog };
