<script setup lang="ts">
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import { useSessionStore } from '@/stores/session'
import ResultSummary from '@/components/exam/ResultSummary.vue'

const props = defineProps<{ id: string }>()
const progress = useProgressStore()
const session = useSessionStore()

const result = computed(() => progress.examResults.find((r) => r.id === props.id) ?? null)

function retake(): void {
  session.clearExam()
}
</script>

<template>
  <div class="stack">
    <template v-if="result">
      <ResultSummary :result="result" />
      <div class="grid grid--2">
        <RouterLink to="/exam" class="btn btn--green btn--block" @click="retake">
          Take another exam
        </RouterLink>
        <RouterLink
          v-if="progress.missedCount > 0"
          to="/review"
          class="btn btn--ghost btn--block"
        >
          Review {{ progress.missedCount }} missed
        </RouterLink>
        <RouterLink v-else to="/practice" class="btn btn--ghost btn--block">Practice more</RouterLink>
      </div>
      <RouterLink to="/" class="btn btn--ghost btn--block">Back to home</RouterLink>
    </template>

    <div v-else class="card center stack">
      <h2>Result not found</h2>
      <p class="muted">This result is no longer available.</p>
      <RouterLink to="/exam" class="btn">Take an exam</RouterLink>
    </div>
  </div>
</template>
