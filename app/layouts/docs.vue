<script setup lang="ts">
const { data: navigation } = await useAsyncData('docs-navigation', () =>
  queryCollectionNavigation('docs'),
)

const { data: files } = useLazyAsyncData('docs-search', () =>
  queryCollectionSearchSections('docs'),
  { server: false },
)

const sidebarOpen = ref(true)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="flex-1 flex">
      <!-- Sidebar -->
      <aside
        v-if="sidebarOpen"
        class="sticky top-(--ui-header-height) h-[calc(100vh-var(--ui-header-height))] w-72 shrink-0 border-r border-default overflow-y-auto"
      >
        <div class="p-4">
          <UContentNavigation
            v-if="navigation"
            :navigation="navigation"
            :default-open="true"
            highlight
          />
        </div>
      </aside>

      <!-- Sidebar toggle (when collapsed) -->
      <button
        v-if="!sidebarOpen"
        class="sticky top-(--ui-header-height) h-[calc(100vh-var(--ui-header-height))] w-6 shrink-0 border-r border-default flex items-center justify-center hover:bg-accented transition-colors"
        title="Open sidebar"
        @click="sidebarOpen = true"
      >
        <UIcon name="i-lucide-chevron-right" class="size-3 text-muted" />
      </button>

      <!-- Main content -->
      <main class="flex-1 min-w-0">
        <!-- Collapse button -->
        <div class="px-4 pt-2">
          <button
            v-if="sidebarOpen"
            class="text-muted hover:text-highlighted transition-colors"
            title="Collapse sidebar"
            @click="sidebarOpen = false"
          >
            <UIcon name="i-lucide-panel-left-close" class="size-4" />
          </button>
        </div>

        <UContainer class="py-4">
          <slot />
        </UContainer>

        <AppFooter />
      </main>
    </div>

    <ClientOnly>
      <UContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </div>
</template>
