import { defineCollection, z } from 'astro:content';

const objects = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      type: z.enum(['made', 'collected', 'memory']),
      category: z.string().min(1),
      summary: z.string().min(1),
      year: z.number().int().min(1800).max(2100),
      status: z.enum([
        'at-home',
        'in-use',
        'gifted',
        'archived',
        'no-longer-with-us',
      ]),
      visibility: z.enum(['public', 'family', 'private']),
      dateAdded: z.coerce.date(),
      images: z
        .array(z.object({ src: image(), alt: z.string().min(1) }))
        .min(1),
      maker: z.string().optional(),
      creator: z.string().optional(),
      materials: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      quantity: z.number().int().positive().optional(),
      edition: z.string().optional(),
      featured: z.boolean().optional(),
    }),
});

export const collections = { objects };
