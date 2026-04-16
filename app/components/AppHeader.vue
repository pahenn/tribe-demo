<script setup lang="ts">
const route = useRoute()

const navItems = [
  { label: 'Old Testament', to: '/docs/old-testament/genesis' },
  { label: 'New Testament', to: '/docs/new-testament/matthew' },
  { label: 'Explore', to: '/explore' },
  { label: 'How It Was Built', to: '/docs/how-this-was-built' },
]
</script>

<template>
  <UHeader title="King James Bible" to="/">
    <template #center>
      <UNavigationMenu :items="navItems" class="hidden md:flex" />
    </template>

    <template #right>
      <UContentSearchButton class="hidden lg:flex" />
      <UColorModeButton />
    </template>
  </UHeader>
</template>
