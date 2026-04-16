<script setup lang="ts">
const chatOpen = useState('chat-open', () => false)
const chatExpanded = useState('chat-expanded', () => false)

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
  ],
})

useSeoMeta({
  titleTemplate: '%s - King James Bible',
  title: 'King James Bible',
  description: 'The complete King James Version with navigable knowledge graph',
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--ui-primary)" />

    <div
      class="transition-[margin-right] duration-200 ease-linear"
      :style="{ marginRight: chatOpen ? (chatExpanded ? '50vw' : '380px') : '0' }"
    >
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>

    <ClientOnly>
      <ChatPanel />
    </ClientOnly>

    <button
      v-if="!chatOpen"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-white shadow-lg hover:opacity-90 transition-all"
      @click="chatOpen = true"
    >
      <UIcon name="i-lucide-message-circle" class="size-5" />
      <span class="text-sm font-medium">Ask</span>
    </button>
  </UApp>
</template>
