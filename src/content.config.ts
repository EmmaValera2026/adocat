import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const noticiesCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/noticies" }),
    schema: z.object({
    date: z.string(),
    category: z.string(),
    categoryClass: z.string(),
    title: z.string(),
    description: z.string(),
    img: z.string().optional(), // Добавили .optional() для совместимости со старыми файлами
    img_url: z.string().optional(),
    img_file: z.string().optional()
  })

});

export const collections = {
  'noticies': noticiesCollection
};
