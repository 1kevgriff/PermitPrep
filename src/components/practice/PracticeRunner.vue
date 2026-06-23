<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '@/stores/session'
import { useProgressStore } from '@/stores/progress'
import QuestionCard from '@/components/question/QuestionCard.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'

const session = useSessionStore()
const progress = useProgressStore()

const run = computed(() => session.practice)
const index = computed(() => run.value?.index ?? 0)
const questions = computed(() => run.value?.questions ?? [])
const current = computed(() => questions.value[index.value])
const selected = computed(() =>
  current.value ? (run.value?.answers[current.value.id] ?? null) : null,
)
const revealed = computed(() => selected.value !== null)
const isLast = computed(() => index.value === questions.value.length - 1)
const done = computed(() => questions.value.length > 0 && index.value >= questions.value.length)

const correctCount = computed(() => {
  if (!run.value) return 0
  return questions.value.filter((q) => run.value!.answers[q.id] === q.answerIndex).length
})

function select(choiceIndex: number): void {
  if (!current.value || revealed.value) return
  session.answerPractice(current.value.id, choiceIndex)
  progress.recordAttempt([{ question: current.value, selectedIndex: choiceIndex }])
}

function next(): void {
  session.setPracticeIndex(index.value + 1)
}

function finish(): void {
  session.setPracticeIndex(questions.value.length)
}
</script>

<template>
  <div v-if="run" class="stack">
    <template v-if="!done && current">
      <div class="stack">
        <div class="row" style="justify-content: space-between">
          <span class="pill">{{ run.kind === 'review' ? 'Review' : 'Practice' }}</span>
          <span class="muted">{{ index + 1 }} / {{ questions.length }}</span>
        </div>
        <ProgressBar :value="index + 1" :max="questions.length" />
      </div>

      <QuestionCard :question="current" :selected-index="selected" :revealed="revealed" @select="select" />

      <div class="row" style="justify-content: flex-end">
        <button v-if="revealed && !isLast" class="btn" @click="next">Next question</button>
        <button v-else-if="revealed && isLast" class="btn btn--green" @click="finish">
          See results
        </button>
        <span v-else class="muted">Pick an answer to see the explanation.</span>
      </div>
    </template>

    <div v-else class="card center stack">
      <h2>Nice work!</h2>
      <p class="muted">
        You got <strong>{{ correctCount }}</strong> of {{ questions.length }} correct.
      </p>
      <slot name="done" />
    </div>
  </div>

  <div v-else class="card center stack">
    <p class="muted">No active session.</p>
    <slot name="empty" />
  </div>
</template>
