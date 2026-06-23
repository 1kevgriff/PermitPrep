<script setup lang="ts">
import type { DeckId } from '@/types/flashcard'

defineProps<{ signCount: number; factCount: number }>()
const emit = defineEmits<{ pick: [deck: DeckId] }>()
</script>

<template>
  <div class="grid grid--2">
    <button class="card deck" @click="emit('pick', 'signs')">
      <span class="deck__icon">⚑</span>
      <span class="deck__title">Traffic Signs</span>
      <span class="muted">{{ signCount }} cards</span>
    </button>
    <button class="card deck" @click="emit('pick', 'facts')">
      <span class="deck__icon">★</span>
      <span class="deck__title">Rules & Facts</span>
      <span class="muted">{{ factCount }} cards</span>
    </button>
  </div>
</template>

<style scoped>
.deck {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
  cursor: pointer;
  border: 1px solid var(--line);
}
.deck__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--blue-soft);
  color: var(--blue);
  font-size: 1.4rem;
  margin-bottom: 6px;
}
.deck__title {
  font-weight: 750;
  font-size: 1.1rem;
}
</style>
