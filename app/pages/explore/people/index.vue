<script setup lang="ts">
useSeoMeta({ title: 'People in the Bible' })

const { data: people } = await useFetch('/api/graph/people')
const search = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return (people.value || []) as Array<{ name: string; count: number }>
  return ((people.value || []) as Array<{ name: string; count: number }>).filter(p =>
    p.name.toLowerCase().includes(q),
  )
})

const grouped = computed(() => {
  const groups = new Map<string, Array<{ name: string; count: number }>>()
  for (const p of filtered.value) {
    const letter = p.name[0]?.toUpperCase() || '#'
    if (!groups.has(letter)) groups.set(letter, [])
    groups.get(letter)!.push(p)
  }
  return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
})
</script>

<template>
  <UContainer class="py-12">
    <div class="mb-6">
      <NuxtLink to="/explore" class="text-sm text-muted hover:text-highlighted mb-2 inline-flex items-center gap-1">
        <UIcon name="i-lucide-arrow-left" class="size-3" /> Explore
      </NuxtLink>
      <h1 class="text-3xl font-bold text-highlighted">People</h1>
      <p class="mt-2 text-muted">{{ people?.length || 0 }} people identified across the King James Bible.</p>
    </div>

    <UInput
      v-model="search"
      icon="i-lucide-search"
      placeholder="Filter people..."
      class="mb-6 max-w-sm"
    />

    <p v-if="search && filtered.length === 0" class="text-sm text-muted">No people matching "{{ search }}"</p>

    <div v-for="[letter, group] in grouped" :key="letter" class="mb-6">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-muted border-b border-default pb-1 mb-3">{{ letter }}</h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="p in group"
          :key="p.name"
          :to="`/explore/people/${encodeURIComponent(p.name.toLowerCase())}`"
          class="inline-flex items-center gap-1.5 rounded-full border border-default px-3 py-1 text-sm hover:bg-accented transition-colors"
        >
          <span class="text-highlighted">{{ p.name }}</span>
          <span class="text-xs text-muted">({{ p.count }})</span>
        </NuxtLink>
      </div>
    </div>
  </UContainer>
</template>
