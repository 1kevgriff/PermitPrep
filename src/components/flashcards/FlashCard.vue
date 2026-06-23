<script setup lang="ts">
import type { FlashCard } from '@/types/flashcard'
import SignImage from '@/components/question/SignImage.vue'

defineProps<{ card: FlashCard; flipped: boolean }>()
const emit = defineEmits<{ flip: [] }>()
</script>

<template>
  <button class="flip" :class="{ 'is-flipped': flipped }" @click="emit('flip')">
    <div class="flip__inner">
      <div class="flip__face flip__front">
        <SignImage v-if="card.image" :src="card.image" alt="Sign on flash card" />
        <p class="flip__text">{{ card.front }}</p>
        <span class="muted flip__hint">Tap to flip</span>
      </div>
      <div class="flip__face flip__back">
        <p class="flip__text">{{ card.back }}</p>
        <span class="muted flip__hint">Tap to flip back</span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.flip {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  perspective: 1200px;
}
.flip__inner {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.45s ease;
  min-height: 320px;
}
.flip.is-flipped .flip__inner {
  transform: rotateY(180deg);
}
.flip__face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.flip__front {
  background:
    radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #f4f8fd 100%);
}
.flip__back {
  transform: rotateY(180deg);
  background:
    radial-gradient(120% 90% at 50% 0%, #1c3454 0%, var(--ink-2) 75%);
  color: #fff;
  border-color: transparent;
}
.flip__back .flip__hint {
  color: rgba(255, 255, 255, 0.7);
}
.flip__text {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.18rem;
  line-height: 1.35;
  text-align: center;
  margin: 0;
}
.flip__hint {
  font-family: var(--font-body);
  font-size: 0.78rem;
  letter-spacing: 0.02em;
}
</style>
