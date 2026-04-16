<script setup lang="ts">
definePageMeta({
  layout: 'docs',
})

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('docs').path(route.path).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
  queryCollectionItemSurroundings('docs', route.path, {
    fields: ['description'],
  }),
)

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
})

// Extract knowledge graph metadata from the page
const meta = computed(() => {
  const p = page.value as any
  return {
    people: p?.people || [],
    peopleNames: (p?.peopleNames || []).filter((v: any) => typeof v === 'string'),
    topics: (p?.topics || []).filter((v: any) => typeof v === 'string'),
    locations: (p?.locations || []).filter((v: any) => typeof v === 'string'),
    events: (p?.events || []).filter((v: any) => typeof v === 'string'),
    era: p?.era || '',
    keyVerses: p?.keyVerses || [],
    crossReferences: p?.crossReferences || [],
    book: p?.book || '',
    chapter: p?.chapter || 0,
    testament: p?.testament || '',
  }
})

const hasMeta = computed(() =>
  meta.value.peopleNames.length > 0
  || meta.value.topics.length > 0
  || meta.value.locations.length > 0,
)
</script>

<template>
  <UPageBody>
    <UPageHeader
      :title="page?.title"
    />

    <!-- Knowledge graph metadata badges -->
    <div v-if="hasMeta" class="mb-6 flex flex-wrap gap-4 text-sm">
      <div v-if="meta.peopleNames.length" class="flex flex-wrap items-center gap-1.5">
        <UIcon name="i-lucide-users" class="size-4 text-muted" />
        <NuxtLink
          v-for="person in meta.peopleNames"
          :key="person"
          :to="`/explore/people/${encodeURIComponent(person.toLowerCase())}`"
          class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          {{ person }}
        </NuxtLink>
      </div>

      <div v-if="meta.topics.length" class="flex flex-wrap items-center gap-1.5">
        <UIcon name="i-lucide-tags" class="size-4 text-muted" />
        <NuxtLink
          v-for="topic in meta.topics"
          :key="topic"
          :to="`/explore/topics/${encodeURIComponent(topic)}`"
          class="rounded-full bg-accented px-2.5 py-0.5 text-xs font-medium text-muted hover:text-highlighted transition-colors"
        >
          {{ topic }}
        </NuxtLink>
      </div>

      <div v-if="meta.locations.length" class="flex flex-wrap items-center gap-1.5">
        <UIcon name="i-lucide-map-pin" class="size-4 text-muted" />
        <NuxtLink
          v-for="loc in meta.locations"
          :key="loc"
          :to="`/explore/locations/${encodeURIComponent(loc.toLowerCase())}`"
          class="rounded-full bg-accented px-2.5 py-0.5 text-xs font-medium text-muted hover:text-highlighted transition-colors"
        >
          {{ loc }}
        </NuxtLink>
      </div>

      <div v-if="meta.era" class="flex items-center gap-1.5">
        <UIcon name="i-lucide-clock" class="size-4 text-muted" />
        <NuxtLink
          :to="`/explore/eras`"
          class="rounded-full bg-accented px-2.5 py-0.5 text-xs font-medium text-muted hover:text-highlighted transition-colors"
        >
          {{ meta.era }}
        </NuxtLink>
      </div>
    </div>

    <!-- Cross-references -->
    <div v-if="meta.crossReferences.length" class="mb-6">
      <h4 class="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Cross-References</h4>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="ref in meta.crossReferences"
          :key="`${ref.book}-${ref.chapter}`"
          :to="`/docs/${meta.testament === 'old' ? 'old' : 'new'}-testament/${ref.book.toLowerCase().replace(/\s+/g, '-')}/chapter-${ref.chapter}`"
          class="flex items-center gap-1.5 rounded border border-default px-2.5 py-1.5 text-xs hover:bg-accented transition-colors"
        >
          <UIcon name="i-lucide-link" class="size-3 text-muted" />
          <span class="font-medium">{{ ref.book }} {{ ref.chapter }}</span>
          <span class="text-muted">{{ ref.label }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Page content -->
    <ContentRenderer v-if="page" :value="page" class="prose dark:prose-invert max-w-none" />

    <!-- Previous / Next navigation -->
    <UContentSurround v-if="surround" :surround="surround" class="mt-8" />
  </UPageBody>
</template>
