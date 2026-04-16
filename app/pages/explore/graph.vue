<script setup lang="ts">
useSeoMeta({ title: 'Graph Visualizer' })

const filterType = ref('cross-references')
const filterValue = ref('')
const searchInput = ref('')

const { data: people } = await useFetch('/api/graph/people')
const { data: topics } = await useFetch('/api/graph/topics')
const { data: locations } = await useFetch('/api/graph/locations')

const queryParams = computed(() => {
  const params: Record<string, string> = { type: filterType.value }
  if (filterValue.value) params.value = filterValue.value
  return params
})

const { data: graphData, refresh } = await useFetch('/api/graph/visualize', {
  query: queryParams,
})

const nodes = computed(() => (graphData.value as any)?.nodes || [])
const links = computed(() => (graphData.value as any)?.links || [])

// Quick picks for each filter type
const quickPicks = computed(() => {
  if (filterType.value === 'person') {
    return ((people.value || []) as any[]).slice(0, 20).map(p => p.name)
  }
  if (filterType.value === 'topic') {
    return ((topics.value || []) as any[]).slice(0, 20).map(t => t.topic)
  }
  if (filterType.value === 'location') {
    return ((locations.value || []) as any[]).slice(0, 20).map(l => l.location)
  }
  return []
})

const filteredPicks = computed(() => {
  if (!searchInput.value) return quickPicks.value
  const q = searchInput.value.toLowerCase()
  return quickPicks.value.filter((p: string) => p.toLowerCase().includes(q))
})

function selectFilter(type: string, value?: string) {
  filterType.value = type
  filterValue.value = value || ''
  searchInput.value = ''
}

function onNodeClick(node: any) {
  if (node.type === 'chapter') {
    selectFilter('chapter', node.label)
  } else if (node.type === 'person') {
    selectFilter('person', node.label)
  } else if (node.type === 'topic') {
    selectFilter('topic', node.label)
  } else if (node.type === 'location') {
    selectFilter('location', node.label)
  }
}

// Preset views
const presets = [
  { label: 'Cross-References', type: 'cross-references', value: '', icon: 'i-lucide-git-branch' },
  { label: 'Moses', type: 'person', value: 'Moses', icon: 'i-lucide-user' },
  { label: 'Jesus', type: 'person', value: 'Jesus', icon: 'i-lucide-user' },
  { label: 'David', type: 'person', value: 'David', icon: 'i-lucide-user' },
  { label: 'Paul', type: 'person', value: 'Paul', icon: 'i-lucide-user' },
  { label: 'Jerusalem', type: 'location', value: 'Jerusalem', icon: 'i-lucide-map-pin' },
  { label: 'Covenant', type: 'topic', value: 'covenant', icon: 'i-lucide-tag' },
  { label: 'Faith', type: 'topic', value: 'faith', icon: 'i-lucide-tag' },
  { label: 'Genesis 1', type: 'chapter', value: 'Genesis 1', icon: 'i-lucide-book-open' },
  { label: 'John 3', type: 'chapter', value: 'John 3', icon: 'i-lucide-book-open' },
]
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-var(--ui-header-height))]">
    <!-- Controls bar -->
    <div class="shrink-0 border-b border-default px-4 py-3">
      <div class="flex items-center gap-3 mb-3">
        <NuxtLink to="/explore" class="text-sm text-muted hover:text-highlighted inline-flex items-center gap-1">
          <UIcon name="i-lucide-arrow-left" class="size-3" /> Explore
        </NuxtLink>
        <h1 class="text-lg font-bold text-highlighted">Graph Visualizer</h1>
        <span class="text-sm text-muted">{{ nodes.length }} nodes, {{ links.length }} connections</span>
      </div>

      <!-- Filter type tabs -->
      <div class="flex items-center gap-2 mb-3">
        <UButton
          v-for="ft in [
            { label: 'Cross-References', value: 'cross-references', icon: 'i-lucide-git-branch' },
            { label: 'By Person', value: 'person', icon: 'i-lucide-users' },
            { label: 'By Topic', value: 'topic', icon: 'i-lucide-tags' },
            { label: 'By Location', value: 'location', icon: 'i-lucide-map-pin' },
            { label: 'By Chapter', value: 'chapter', icon: 'i-lucide-book-open' },
          ]"
          :key="ft.value"
          :icon="ft.icon"
          :label="ft.label"
          :variant="filterType === ft.value ? 'solid' : 'outline'"
          :color="filterType === ft.value ? 'primary' : 'neutral'"
          size="xs"
          @click="selectFilter(ft.value)"
        />
      </div>

      <!-- Search / value input -->
      <div v-if="filterType !== 'cross-references'" class="flex items-center gap-2">
        <UInput
          v-model="searchInput"
          icon="i-lucide-search"
          :placeholder="`Search ${filterType}s...`"
          class="max-w-xs"
          size="sm"
          @keydown.enter="filterValue = searchInput"
        />
      </div>

      <!-- Quick picks -->
      <div class="flex flex-wrap gap-1.5 mt-2">
        <button
          v-for="preset in (filterType === 'cross-references' ? presets : filteredPicks.map((p: string) => ({ label: p, type: filterType, value: p })))"
          :key="preset.label"
          class="rounded-full border px-2.5 py-0.5 text-xs transition-colors"
          :class="filterValue === (preset as any).value && filterType === (preset as any).type
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-default text-muted hover:text-highlighted hover:bg-accented'"
          @click="selectFilter((preset as any).type, (preset as any).value)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <!-- Graph -->
    <div class="flex-1 min-h-0">
      <ClientOnly>
        <GraphVisualization
          :nodes="nodes"
          :links="links"
          @node-click="onNodeClick"
        />
      </ClientOnly>
    </div>
  </div>
</template>
