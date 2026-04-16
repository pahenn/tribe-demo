export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@comark/nuxt',
  ],
  colorMode: {
    classSuffix: '',
  },
  css: ['~/assets/css/main.css'],
})
