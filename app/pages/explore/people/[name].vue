<script setup lang="ts">
const route = useRoute()
const nameParam = decodeURIComponent(route.params.name as string)

const { data: people } = await useFetch('/api/graph/people')

const person = computed(() => {
  return (people.value as any[])?.find(
    (p: any) => p.name.toLowerCase() === nameParam,
  )
})

if (!person.value) {
  throw createError({ statusCode: 404, statusMessage: 'Person not found' })
}

useSeoMeta({ title: person.value.name })
</script>

<template>
  <UContainer class="py-12">
    <div class="mb-8">
      <NuxtLink to="/explore/people" class="text-sm text-muted hover:text-highlighted mb-2 inline-flex items-center gap-1">
        <UIcon name="i-lucide-arrow-left" class="size-3" /> All People
      </NuxtLink>
      <h1 class="text-3xl font-bold text-highlighted">{{ person.name }}</h1>
      <p class="mt-2 text-muted">Appears in {{ person.count }} chapter{{ person.count !== 1 ? 's' : '' }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <NuxtLink
        v-for="ch in person.chapters"
        :key="ch.path"
        :to="ch.path"
        class="block rounded-lg border border-default p-3 hover:bg-accented transition-colors"
      >
        <span class="text-sm font-medium text-highlighted">{{ ch.title }}</span>
      </NuxtLink>
    </div>
  </UContainer>
</template>
