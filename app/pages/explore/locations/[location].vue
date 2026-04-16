<script setup lang="ts">
const route = useRoute()
const locParam = decodeURIComponent(route.params.location as string)

const { data: locations } = await useFetch('/api/graph/locations')

const location = computed(() => {
  return (locations.value as any[])?.find(
    (l: any) => l.location.toLowerCase() === locParam,
  )
})

if (!location.value) {
  throw createError({ statusCode: 404, statusMessage: 'Location not found' })
}

useSeoMeta({ title: location.value.location })
</script>

<template>
  <UContainer class="py-12">
    <div class="mb-8">
      <NuxtLink to="/explore/locations" class="text-sm text-muted hover:text-highlighted mb-2 inline-flex items-center gap-1">
        <UIcon name="i-lucide-arrow-left" class="size-3" /> All Locations
      </NuxtLink>
      <h1 class="text-3xl font-bold text-highlighted">{{ location.location }}</h1>
      <p class="mt-2 text-muted">Mentioned in {{ location.count }} chapter{{ location.count !== 1 ? 's' : '' }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <NuxtLink
        v-for="ch in location.chapters"
        :key="ch.path"
        :to="ch.path"
        class="block rounded-lg border border-default p-3 hover:bg-accented transition-colors"
      >
        <span class="text-sm font-medium text-highlighted">{{ ch.title }}</span>
      </NuxtLink>
    </div>
  </UContainer>
</template>
