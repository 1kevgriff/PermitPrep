<script setup lang="ts">
import type { DeckId } from '@/types/flashcard'

defineProps<{ signCount: number; factCount: number }>()
const emit = defineEmits<{ pick: [deck: DeckId] }>()
</script>

<template>
  <div class="grid grid--2">
    <button class="card deck" @click="emit('pick', 'signs')">
      <span class="deck__icon deck__icon--amber" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 22 12 12 22 2 12Z" /><path d="M12 8v4M12 16h.01" /></svg>
      </span>
      <span class="deck__title">Traffic Signs</span>
      <span class="muted">{{ signCount }} cards</span>
    </button>
    <button class="card deck" @click="emit('pick', 'facts')">
      <span class="deck__icon deck__icon--green" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>
      </span>
      <span class="deck__title">Rules &amp; Facts</span>
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
  transition:
    transform 0.12s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}
.deck:active {
  transform: translateY(2px) scale(0.99);
}
.deck:hover {
  border-color: #cfd9e6;
  box-shadow: 0 8px 22px rgba(16, 32, 56, 0.1);
}
.deck__icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: var(--sky-soft);
  color: var(--sky-dark);
  margin-bottom: 8px;
}
.deck__icon--amber {
  background: var(--amber-soft);
  color: #9a6708;
}
.deck__icon--green {
  background: var(--green-soft);
  color: var(--green-dark);
}
.deck__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.08rem;
}
</style>
