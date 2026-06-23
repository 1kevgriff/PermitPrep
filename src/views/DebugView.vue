<script setup lang="ts">
import { computed, ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content'
import type { Question } from '@/types/question'
import SignImage from '@/components/question/SignImage.vue'
import ChoiceList from '@/components/question/ChoiceList.vue'

const content = useContentStore()
const { questions } = storeToRefs(content)

type Filter = 'all' | 'sign' | 'general'
const filter = ref<Filter>('all')

const list = computed<Question[]>(() => {
  if (filter.value === 'all') return questions.value
  return questions.value.filter((q) => q.type === filter.value)
})

const idx = ref(0)
const current = computed<Question | undefined>(() => list.value[idx.value])

// Per-question state, keyed by id so it survives navigation and filtering.
const picks = reactive<Record<string, number>>({})
const revealedIds = reactive<Record<string, true>>({})

const selected = computed(() =>
  current.value ? (picks[current.value.id] ?? null) : null,
)
const revealed = computed(() =>
  !!current.value && (selected.value !== null || revealedIds[current.value.id] === true),
)

const letters = ['A', 'B', 'C', 'D', 'E', 'F']
const section = computed(() =>
  current.value ? content.sectionBySlug.get(current.value.manualRef.sectionSlug) : undefined,
)

// Clamp the cursor whenever the filtered list shrinks under it.
watch(list, (l) => {
  if (idx.value > l.length - 1) idx.value = Math.max(0, l.length - 1)
})

function setFilter(f: Filter): void {
  filter.value = f
  idx.value = 0
}
function select(choiceIndex: number): void {
  if (!current.value || revealed.value) return
  picks[current.value.id] = choiceIndex
}
function reveal(): void {
  if (current.value) revealedIds[current.value.id] = true
}
function prev(): void {
  if (idx.value > 0) idx.value--
}
function next(): void {
  if (idx.value < list.value.length - 1) idx.value++
}
function jumpTo(e: Event): void {
  const n = Number((e.target as HTMLInputElement).value)
  if (Number.isFinite(n)) idx.value = Math.min(Math.max(0, n - 1), list.value.length - 1)
}

function onKey(e: KeyboardEvent): void {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'r' || e.key === 'R' || e.key === ' ') {
    e.preventDefault()
    reveal()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <section class="stack">
    <header class="stack">
      <h1>Debug · Question Browser</h1>
      <p class="muted">
        Step through every question in bank order. Click a choice to self-test, or reveal the
        answer. <strong>← →</strong> to move, <strong>R</strong> to reveal.
      </p>
      <div class="row" role="tablist" aria-label="Filter questions">
        <button
          class="btn btn--ghost"
          :class="{ 'btn--green': filter === 'all' }"
          @click="setFilter('all')"
        >
          All ({{ questions.length }})
        </button>
        <button
          class="btn btn--ghost"
          :class="{ 'btn--green': filter === 'sign' }"
          @click="setFilter('sign')"
        >
          Signs ({{ content.signQuestions.length }})
        </button>
        <button
          class="btn btn--ghost"
          :class="{ 'btn--green': filter === 'general' }"
          @click="setFilter('general')"
        >
          General ({{ content.generalQuestions.length }})
        </button>
      </div>
    </header>

    <div v-if="current" class="card stack">
      <div class="row dbg-meta">
        <span class="pill">{{ current.type }}</span>
        <span class="pill">{{ current.topic }}</span>
        <span class="muted mono">{{ current.id }}</span>
        <span class="muted">§ {{ current.manualRef.sectionSlug }}</span>
      </div>

      <SignImage
        v-if="current.type === 'sign'"
        :src="current.image"
        alt="Traffic sign to identify"
      />

      <h2 class="dbg-prompt">{{ current.prompt }}</h2>

      <ChoiceList
        :choices="current.choices"
        :selected-index="selected"
        :answer-index="current.answerIndex"
        :revealed="revealed"
        @select="select"
      />

      <div v-if="revealed" class="dbg-answer">
        <strong>
          Answer: {{ letters[current.answerIndex] }} — {{ current.choices[current.answerIndex] }}
        </strong>
        <p v-if="selected !== null" class="muted">
          You picked {{ letters[selected] }} —
          {{ selected === current.answerIndex ? 'correct ✓' : 'wrong ✗' }}
        </p>
        <p>{{ current.explanation }}</p>
        <RouterLink v-if="section" :to="`/manual/${section.slug}`" class="dbg-link">
          Read more in {{ section.title }} →
        </RouterLink>
      </div>
      <div v-else class="row" style="justify-content: flex-end">
        <button class="btn" @click="reveal">Reveal answer (R)</button>
      </div>
    </div>

    <div v-else class="card center">
      <p class="muted">No questions match this filter.</p>
    </div>

    <nav class="row dbg-nav" aria-label="Question navigation">
      <button class="btn btn--ghost" :disabled="idx === 0" @click="prev">← Prev</button>
      <span class="dbg-counter">
        <input
          type="number"
          class="dbg-jump"
          :value="idx + 1"
          min="1"
          :max="list.length"
          aria-label="Jump to question number"
          @change="jumpTo"
        />
        / {{ list.length }}
      </span>
      <button class="btn btn--ghost" :disabled="idx >= list.length - 1" @click="next">
        Next →
      </button>
    </nav>
  </section>
</template>

<style scoped>
.dbg-meta {
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85rem;
}
.dbg-prompt {
  font-size: 1.2rem;
}
.dbg-answer {
  margin-top: 4px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--green);
  background: var(--green-soft);
}
.dbg-answer p {
  margin: 6px 0 8px;
}
.dbg-link {
  font-weight: 650;
}
.dbg-nav {
  justify-content: space-between;
  align-items: center;
}
.dbg-counter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--muted, #667);
}
.dbg-jump {
  width: 64px;
  padding: 8px 10px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  font-size: 1rem;
  text-align: center;
}
</style>
