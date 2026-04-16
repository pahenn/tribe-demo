<script setup lang="ts">
const { data: page } = await useAsyncData('landing', () =>
  queryCollection('landing').path('/').first(),
)
</script>

<template>
  <div>
    <ContentRenderer v-if="page" :value="page" />
  </div>
</template>
