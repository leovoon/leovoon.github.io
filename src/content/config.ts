import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z
      .string()
      .or(z.date())
      .transform((val: string | number | Date) => new Date(val)),
    updatedDate: z
      .string()
      .or(z.date())
      .optional()
      .transform((str: string | number | Date | undefined) => (str ? new Date(str) : undefined)),
      heroImage: image().optional(),
      tags: z.array(z.string()),
    }),
  },
);

export const collections = { blog };
