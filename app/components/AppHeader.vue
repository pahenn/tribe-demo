<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[] = [
  {
    label: 'Bible',
    icon: 'i-lucide-book-open',
    children: [
      { label: 'Old Testament', to: '/docs/old-testament/genesis', icon: 'i-lucide-scroll-text', description: 'Genesis through Malachi' },
      { label: 'New Testament', to: '/docs/new-testament/matthew', icon: 'i-lucide-book-open', description: 'Matthew through Revelation' },
    ],
  },
  {
    label: 'Explore',
    icon: 'i-lucide-compass',
    slot: 'explore',
    children: [
      { label: 'People', to: '/explore/people', icon: 'i-lucide-users', description: 'Browse by person' },
      { label: 'Topics', to: '/explore/topics', icon: 'i-lucide-tags', description: 'Browse by theme' },
      { label: 'Locations', to: '/explore/locations', icon: 'i-lucide-map-pin', description: 'Browse by place' },
      { label: 'Eras', to: '/explore/eras', icon: 'i-lucide-clock', description: 'Browse by time period' },
      { label: 'Graph Visualizer', to: '/explore/graph', icon: 'i-lucide-waypoints', description: 'Interactive network graph' },
    ],
  },
  {
    label: 'How It Was Built',
    icon: 'i-lucide-hammer',
    to: '/docs/how-this-was-built/building-the-knowledge-graph',
  },
]
</script>

<template>
  <UHeader title="King James Bible" to="/">
    <template #default>
      <UNavigationMenu :items="items">
        <template #explore-content>
          <div class="flex flex-col">
            <div class="grid grid-cols-2 gap-1 p-2">
              <NuxtLink
                v-for="child in items[1]!.children"
                :key="child.label"
                :to="(child as any).to"
                class="flex items-start gap-3 rounded-md p-2.5 hover:bg-accented transition-colors"
              >
                <UIcon :name="(child as any).icon" class="size-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-highlighted">{{ child.label }}</div>
                  <div class="text-xs text-muted">{{ (child as any).description }}</div>
                </div>
              </NuxtLink>
            </div>
            <NuxtLink
              to="/explore"
              class="flex items-center justify-center gap-1 border-t border-default px-4 py-2 text-xs text-muted hover:text-highlighted hover:bg-accented transition-colors"
            >
              Explore the full knowledge graph
              <UIcon name="i-lucide-arrow-right" class="size-3" />
            </NuxtLink>
          </div>
        </template>
      </UNavigationMenu>
    </template>

    <template #right>
      <UContentSearchButton />
      <UColorModeButton />
    </template>
  </UHeader>
</template>
