<script setup lang="ts">
import type { Rating } from '@/types/flashcard'
const emit = defineEmits<{ rate: [rating: Rating] }>()
</script>

<template>
  <div class="row rate">
    <button class="btn btn--ghost rate__btn" @click="emit('rate', 'review')">↺ Review again</button>
    <button class="btn btn--green rate__btn" @click="emit('rate', 'gotIt')">✓ Got it</button>
  </div>
</template>

<style scoped>
.rate {
  justify-content: space-between;
}
.rate__btn {
  flex: 1;
}
</style>
