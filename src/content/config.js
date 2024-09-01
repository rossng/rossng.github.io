// @ts-ignore
import { defineCollection, z } from "astro:content";
var posts = defineCollection({
    // Type-check frontmatter using a schema
    schema: z.object({
        title: z.string(),
        date: z.date(),
    }),
});
export var collections = { posts: posts };
