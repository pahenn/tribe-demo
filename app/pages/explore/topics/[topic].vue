<script setup lang="ts">
const route = useRoute()
const topicParam = decodeURIComponent(route.params.topic as string)

const { data: topics } = await useFetch('/api/graph/topics')

const topic = computed(() => {
  return (topics.value as any[])?.find((t: any) => t.topic === topicParam)
})

if (!topic.value) {
  throw createError({ statusCode: 404, statusMessage: 'Topic not found' })
}

useSeoMeta({ title: topicParam })
</script>

<template>
  <UContainer class="py-12">
    <div class="mb-8">
      <NuxtLink to="/explore/topics" class="text-sm text-muted hover:text-highlighted mb-2 inline-flex items-center gap-1">
        <UIcon name="i-lucide-arrow-left" class="size-3" /> All Topics
      </NuxtLink>
      <h1 class="text-3xl font-bold text-highlighted">{{ topicParam }}</h1>
      <p class="mt-2 text-muted">{{ topic.count }} chapter{{ topic.count !== 1 ? 's' : '' }} tagged with this topic</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <NuxtLink
        v-for="ch in topic.chapters"
        :key="ch.path"
        :to="ch.path"
        class="block rounded-lg border border-default p-3 hover:bg-accented transition-colors"
      >
        <span class="text-sm font-medium text-highlighted">{{ ch.title }}</span>
      </NuxtLink>
    </div>
  </UContainer>
</template>
