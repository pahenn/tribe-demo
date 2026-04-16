<script setup lang="ts">
useSeoMeta({ title: 'Topics & Themes' })

const { data: topics } = await useFetch('/api/graph/topics')
const search = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return (topics.value || []) as Array<{ topic: string; count: number }>
  return ((topics.value || []) as Array<{ topic: string; count: number }>).filter(t =>
    t.topic.toLowerCase().includes(q),
  )
})
</script>

<template>
  <UContainer class="py-12">
    <div class="mb-6">
      <NuxtLink to="/explore" class="text-sm text-muted hover:text-highlighted mb-2 inline-flex items-center gap-1">
        <UIcon name="i-lucide-arrow-left" class="size-3" /> Explore
      </NuxtLink>
      <h1 class="text-3xl font-bold text-highlighted">Topics & Themes</h1>
      <p class="mt-2 text-muted">{{ topics?.length || 0 }} topics identified across the King James Bible.</p>
    </div>

    <UInput
      v-model="search"
      icon="i-lucide-search"
      placeholder="Filter topics..."
      class="mb-6 max-w-sm"
    />

    <p v-if="search && filtered.length === 0" class="text-sm text-muted">No topics matching "{{ search }}"</p>

    <div class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="t in filtered"
        :key="t.topic"
        :to="`/explore/topics/${encodeURIComponent(t.topic)}`"
        class="inline-flex items-center gap-1.5 rounded-full border border-default px-3 py-1.5 text-sm hover:bg-accented transition-colors"
      >
        <span class="text-highlighted">{{ t.topic }}</span>
        <span class="text-xs text-muted">({{ t.count }})</span>
      </NuxtLink>
    </div>
  </UContainer>
</template>
