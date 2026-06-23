<script setup lang="ts">
import { ref, computed } from 'vue'
import { useContentStore } from '@/stores/content'
import { useProgressStore } from '@/stores/progress'
import { orderDeck, rateCard, initialCardProgress } from '@/lib/srs'
import type { DeckId, FlashCard, Rating } from '@/types/flashcard'
import DeckPicker from '@/components/flashcards/DeckPicker.vue'
import FlashCardView from '@/components/flashcards/FlashCard.vue'
import RateButtons from '@/components/flashcards/RateButtons.vue'

const content = useContentStore()
const progress = useProgressStore()

const deck = ref<DeckId | null>(null)
const queue = ref<FlashCard[]>([])
const pos = ref(0)
const flipped = ref(false)
const reviewed = ref(0)

const current = computed(() => queue.value[pos.value] ?? null)
const done = computed(() => deck.value !== null && pos.value >= queue.value.length)

function pick(which: DeckId): void {
  deck.value = which
  const cards = which === 'signs' ? content.signCards : content.factCards
  queue.value = orderDeck(cards, progress.cards, Date.now())
  pos.value = 0
  flipped.value = false
  reviewed.value = 0
}

function rate(rating: Rating): void {
  const card = current.value
  if (!card) return
  const prev = progress.cards[card.id] ?? initialCardProgress()
  const updated = rateCard(prev, rating, Date.now())
  progress.updateCard(card.id, updated)
  reviewed.value++
  // A card marked "review again" resurfaces at the end of this session.
  if (rating === 'review') queue.value.push(card)
  pos.value++
  flipped.value = false
}

function restart(): void {
  if (deck.value) pick(deck.value)
}
function backToDecks(): void {
  deck.value = null
  queue.value = []
}
</script>

<template>
  <div class="stack">
    <div v-if="!deck">
      <div class="card stack" style="margin-bottom: 14px">
        <h1>Flash Cards</h1>
        <p class="muted">
          Flip through signs and rules. Cards you mark “review” come back sooner — spaced
          repetition keeps the tricky ones in front of you.
        </p>
      </div>
      <DeckPicker
        :sign-count="content.signCards.length"
        :fact-count="content.factCards.length"
        @pick="pick"
      />
    </div>

    <template v-else-if="!done && current">
      <div class="row" style="justify-content: space-between">
        <button class="btn btn--ghost" @click="backToDecks">← Decks</button>
        <span class="muted">{{ reviewed }} reviewed</span>
      </div>
      <FlashCardView :card="current" :flipped="flipped" @flip="flipped = !flipped" />
      <RateButtons v-if="flipped" @rate="rate" />
      <p v-else class="muted center">Flip the card, then rate how you did.</p>
    </template>

    <div v-else class="card center stack">
      <h2>Deck complete! 🎉</h2>
      <p class="muted">You reviewed {{ reviewed }} cards.</p>
      <div class="grid grid--2">
        <button class="btn btn--block" @click="restart">Study again</button>
        <button class="btn btn--ghost btn--block" @click="backToDecks">Other deck</button>
      </div>
    </div>
  </div>
</template>
