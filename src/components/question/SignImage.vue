<script setup lang="ts">
import { computed } from 'vue'
import { assetUrl } from '@/data/loaders'

const props = defineProps<{ src: string; alt?: string }>()
const url = computed(() => assetUrl(props.src))
</script>

<template>
  <div class="sign">
    <img :src="url" :alt="alt ?? 'Traffic sign'" loading="lazy" decoding="async" />
  </div>
</template>

<style scoped>
.sign {
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--blue-soft);
  border-radius: 12px;
  margin-bottom: 16px;
}
.sign img {
  width: 160px;
  height: 160px;
  object-fit: contain;
  image-rendering: auto;
}
</style>
