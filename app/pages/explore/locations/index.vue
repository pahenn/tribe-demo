<script setup lang="ts">
useSeoMeta({ title: 'Locations' })

const { data: locations } = await useFetch('/api/graph/locations')
const search = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return (locations.value || []) as Array<{ location: string; count: number }>
  return ((locations.value || []) as Array<{ location: string; count: number }>).filter(l =>
    l.location.toLowerCase().includes(q),
  )
})
</script>

<template>
  <UContainer class="py-12">
    <div class="mb-6">
      <NuxtLink to="/explore" class="text-sm text-muted hover:text-highlighted mb-2 inline-flex items-center gap-1">
        <UIcon name="i-lucide-arrow-left" class="size-3" /> Explore
      </NuxtLink>
      <h1 class="text-3xl font-bold text-highlighted">Locations</h1>
      <p class="mt-2 text-muted">{{ locations?.length || 0 }} places mentioned across the King James Bible.</p>
    </div>

    <UInput
      v-model="search"
      icon="i-lucide-search"
      placeholder="Filter locations..."
      class="mb-6 max-w-sm"
    />

    <p v-if="search && filtered.length === 0" class="text-sm text-muted">No locations matching "{{ search }}"</p>

    <div class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="l in filtered"
        :key="l.location"
        :to="`/explore/locations/${encodeURIComponent(l.location.toLowerCase())}`"
        class="inline-flex items-center gap-1.5 rounded-full border border-default px-3 py-1.5 text-sm hover:bg-accented transition-colors"
      >
        <span class="text-highlighted">{{ l.location }}</span>
        <span class="text-xs text-muted">({{ l.count }})</span>
      </NuxtLink>
    </div>
  </UContainer>
</template>
