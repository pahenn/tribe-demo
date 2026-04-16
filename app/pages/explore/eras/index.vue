<script setup lang="ts">
useSeoMeta({ title: 'Biblical Eras' })

const { data: eras } = await useFetch('/api/graph/eras')

const eraLabels: Record<string, string> = {
  'primeval-history': 'Primeval History',
  'patriarchal': 'Patriarchal Era',
  'exodus': 'The Exodus',
  'conquest': 'Conquest of Canaan',
  'judges': 'Period of the Judges',
  'united-monarchy': 'United Monarchy',
  'divided-monarchy': 'Divided Monarchy',
  'exile': 'The Exile',
  'post-exile': 'Post-Exile',
  'life-of-christ': 'Life of Christ',
  'early-church': 'The Early Church',
}

const eraDescriptions: Record<string, string> = {
  'primeval-history': 'Creation, the Fall, the Flood, and the Tower of Babel',
  'patriarchal': 'Abraham, Isaac, Jacob, and Joseph',
  'exodus': 'Moses, the plagues, the Red Sea, and Mount Sinai',
  'conquest': 'Joshua leads Israel into the Promised Land',
  'judges': 'Cycles of sin, oppression, and deliverance',
  'united-monarchy': 'Saul, David, and Solomon — one kingdom',
  'divided-monarchy': 'Israel and Judah split — prophets and kings',
  'exile': 'Babylon conquers Judah — Daniel, Ezekiel',
  'post-exile': 'Return to Jerusalem — Ezra, Nehemiah, Esther',
  'life-of-christ': 'The Gospels — birth, ministry, death, and resurrection of Jesus',
  'early-church': 'Acts and the Epistles — the spread of Christianity',
}
</script>

<template>
  <UContainer class="py-12">
    <div class="mb-8">
      <NuxtLink to="/explore" class="text-sm text-muted hover:text-highlighted mb-2 inline-flex items-center gap-1">
        <UIcon name="i-lucide-arrow-left" class="size-3" /> Explore
      </NuxtLink>
      <h1 class="text-3xl font-bold text-highlighted">Biblical Eras</h1>
      <p class="mt-2 text-muted">The Bible spans thousands of years. Here's how the chapters break down by historical period.</p>
    </div>

    <!-- Timeline -->
    <div class="space-y-1">
      <div
        v-for="era in (eras || []) as Array<{ era: string; count: number; chapters: Array<{ path: string; title: string; book: string }> }>"
        :key="era.era"
        class="group"
      >
        <details class="rounded-xl border border-default overflow-hidden">
          <summary class="flex items-center gap-4 p-4 cursor-pointer hover:bg-accented transition-colors select-none">
            <!-- Timeline dot -->
            <div class="flex flex-col items-center shrink-0">
              <div class="size-3 rounded-full bg-primary" />
            </div>

            <div class="flex-1">
              <h2 class="font-semibold text-highlighted">{{ eraLabels[era.era] || era.era }}</h2>
              <p class="text-sm text-muted">{{ eraDescriptions[era.era] || '' }}</p>
            </div>

            <span class="text-sm text-muted shrink-0">{{ era.count }} chapters</span>
          </summary>

          <div class="border-t border-default p-4">
            <!-- Group chapters by book -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <NuxtLink
                v-for="ch in era.chapters"
                :key="ch.path"
                :to="ch.path"
                class="block rounded border border-default px-3 py-2 text-sm hover:bg-accented transition-colors"
              >
                <span class="font-medium text-highlighted">{{ ch.title }}</span>
              </NuxtLink>
            </div>
          </div>
        </details>
      </div>
    </div>
  </UContainer>
</template>
