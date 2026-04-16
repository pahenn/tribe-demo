<script setup lang="ts">
import type { ContentNavigationItem, PageCollections } from '@nuxt/content'
import * as nuxtUiLocales from '@nuxt/ui/locale'
import { transformNavigation } from '#build/../node_modules/.pnpm/docus@5.9.0_5ee613190f0b90995f0a399a5786413f/node_modules/docus/app/utils/navigation'
import { useDocusColorMode } from '#build/../node_modules/.pnpm/docus@5.9.0_5ee613190f0b90995f0a399a5786413f/node_modules/docus/app/composables/useDocusColorMode'
import { useSubNavigation } from '#build/../node_modules/.pnpm/docus@5.9.0_5ee613190f0b90995f0a399a5786413f/node_modules/docus/app/composables/useSubNavigation'

const appConfig = useAppConfig()
const { seo } = appConfig
const { forced: forcedColorMode } = useDocusColorMode()
const site = useSiteConfig()
const { locale, locales, isEnabled, switchLocalePath } = useDocusI18n()

const chatOpen = useState('chat-open', () => false)
const chatExpanded = useState('chat-expanded', () => false)

const nuxtUiLocale = computed(() => nuxtUiLocales[locale.value as keyof typeof nuxtUiLocales] || nuxtUiLocales.en)
const lang = computed(() => nuxtUiLocale.value.code)
const dir = computed(() => nuxtUiLocale.value.dir)
const collectionName = computed(() => isEnabled.value ? `docs_${locale.value}` : 'docs')

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
  ],
  htmlAttrs: {
    lang,
    dir,
  },
})

useSeoMeta({
  titleTemplate: seo.titleTemplate,
  title: seo.title,
  description: seo.description,
  ogSiteName: site.name,
  twitterCard: 'summary_large_image',
})

if (isEnabled.value) {
  const route = useRoute()
  const defaultLocale = useRuntimeConfig().public.i18n.defaultLocale!
  onMounted(() => {
    const currentLocale = route.path.split('/')[1]
    if (!locales.some(locale => locale.code === currentLocale)) {
      return navigateTo(switchLocalePath(defaultLocale) as string)
    }
  })
}

const { data: navigation } = await useAsyncData(() => `navigation_${collectionName.value}`, () => queryCollectionNavigation(collectionName.value as keyof PageCollections), {
  transform: (data: ContentNavigationItem[]) => transformNavigation(data, isEnabled.value, locale.value),
  watch: [locale],
})
const { data: files } = useLazyAsyncData(`search_${collectionName.value}`, () => queryCollectionSearchSections(collectionName.value as keyof PageCollections), {
  server: false,
  watch: [locale],
})

provide('navigation', navigation)

const { subNavigationMode } = useSubNavigation(navigation)
</script>

<template>
  <UApp :locale="nuxtUiLocale">
    <NuxtLoadingIndicator color="var(--ui-primary)" />

    <div
      :class="['transition-[margin-right] duration-200 ease-linear will-change-[margin-right]', { 'docus-sub-header': subNavigationMode === 'header' }]"
      :style="{ marginRight: chatOpen ? (chatExpanded ? '50vw' : '380px') : '0' }"
    >
      <AppHeader v-if="$route.meta.header !== false" />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <AppFooter v-if="$route.meta.footer !== false" />
    </div>

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
        :color-mode="!forcedColorMode"
      />
    </ClientOnly>

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

<style>
@media (min-width: 1024px) {
  .docus-sub-header {
    /* 64px base header + 48px sub-navigation bar */
    --ui-header-height: 112px;
  }
}
</style>
