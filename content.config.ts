import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: {
        include: 'docs/**',
        prefix: '/docs',
      },
      schema: z.object({
        book: z.string().optional(),
        bookNumber: z.number().optional(),
        chapter: z.number().optional(),
        testament: z.string().optional(),
        verseCount: z.number().optional(),
        author: z.string().optional(),
        chapterCount: z.number().optional(),
        genre: z.array(z.string()).optional(),
        themes: z.array(z.string()).optional(),
        peopleNames: z.array(z.string()).optional(),
        people: z.array(z.object({
          name: z.string(),
          role: z.string(),
        })).optional(),
        locations: z.array(z.string()).optional(),
        timePeriod: z.string().optional(),
        era: z.string().optional(),
        topics: z.array(z.string()).optional(),
        events: z.array(z.string()).optional(),
        keyVerses: z.array(z.number()).optional(),
        crossReferences: z.array(z.object({
          book: z.string(),
          chapter: z.number(),
          label: z.string(),
        })).optional(),
      }),
    }),
    landing: defineCollection({
      type: 'page',
      source: {
        include: 'index.md',
      },
    }),
  },
})
