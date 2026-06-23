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
/* Sign sits on a clean white "plate" over a soft road-haze gradient,
   so the yellow/red signage reads at full contrast. */
.sign {
  display: grid;
  place-items: center;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 18px;
  background:
    radial-gradient(120% 100% at 50% 0%, #eef3fa 0%, #e7edf6 100%);
  border: 1px solid var(--line);
}
.sign img {
  width: 168px;
  height: 168px;
  object-fit: contain;
  image-rendering: auto;
  padding: 14px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(16, 32, 56, 0.12);
}
</style>
