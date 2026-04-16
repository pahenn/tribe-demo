<script setup lang="ts">
useSeoMeta({ title: 'Explore the Knowledge Graph' })

const { data: people } = await useFetch('/api/graph/people')
const { data: topics } = await useFetch('/api/graph/topics')
const { data: locations } = await useFetch('/api/graph/locations')
const { data: eras } = await useFetch('/api/graph/eras')

const cards = computed(() => [
  {
    title: 'People',
    description: `${people.value?.length || 0} people across 1,189 chapters`,
    icon: 'i-lucide-users',
    to: '/explore/people',
    examples: (people.value as any[])?.slice(0, 5).map((p: any) => p.name) || [],
  },
  {
    title: 'Topics',
    description: `${topics.value?.length || 0} topics and themes`,
    icon: 'i-lucide-tags',
    to: '/explore/topics',
    examples: (topics.value as any[])?.slice(0, 5).map((t: any) => t.topic) || [],
  },
  {
    title: 'Locations',
    description: `${locations.value?.length || 0} places mentioned`,
    icon: 'i-lucide-map-pin',
    to: '/explore/locations',
    examples: (locations.value as any[])?.slice(0, 5).map((l: any) => l.location) || [],
  },
  {
    title: 'Eras',
    description: `${eras.value?.length || 0} historical periods`,
    icon: 'i-lucide-clock',
    to: '/explore/eras',
    examples: (eras.value as any[])?.map((e: any) => e.era) || [],
  },
  {
    title: 'Graph Visualizer',
    description: 'Interactive network graph of connections',
    icon: 'i-lucide-waypoints',
    to: '/explore/graph',
    examples: ['Cross-references', 'Moses', 'Jesus', 'Jerusalem', 'Covenant'],
  },
])
</script>

<template>
  <UContainer class="py-12">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-highlighted">Explore the Knowledge Graph</h1>
      <p class="mt-2 text-muted max-w-2xl">
        Browse the Bible by people, topics, locations, and historical eras. Every chapter has been annotated with structured metadata — click any tag to see all the chapters where it appears.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NuxtLink
        v-for="card in cards"
        :key="card.title"
        :to="card.to"
        class="group block rounded-xl border border-default p-6 hover:bg-accented transition-colors"
      >
        <div class="flex items-start gap-4">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <UIcon :name="card.icon" class="size-5 text-primary" />
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-highlighted group-hover:text-primary transition-colors">
              {{ card.title }}
            </h2>
            <p class="mt-1 text-sm text-muted">{{ card.description }}</p>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="ex in card.examples"
                :key="ex"
                class="rounded-full bg-default border border-default px-2 py-0.5 text-xs text-muted"
              >
                {{ ex }}
              </span>
              <span class="text-xs text-dimmed self-center">...</span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </UContainer>
</template>
