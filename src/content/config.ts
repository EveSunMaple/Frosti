import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		badge: z.string().optional(),
		tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
			message: 'tags must be unique',
		}).optional(),
	}),
});

export const collections = { blog };
