<script setup lang="ts">
import { onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useContentStore } from '@/stores/content'
import { useSessionStore } from '@/stores/session'
import { useProgressStore } from '@/stores/progress'
import { selectPracticeQuestions } from '@/lib/selection'
import { rngFromSeed } from '@/lib/shuffle'
import PracticeRunner from '@/components/practice/PracticeRunner.vue'

const content = useContentStore()
const session = useSessionStore()
const progress = useProgressStore()

onMounted(() => {
  const missed = progress.missedIds
  if (missed.size === 0) return
  const questions = selectPracticeQuestions(
    content.questions,
    { topic: 'all', length: missed.size, onlyMissed: true },
    rngFromSeed(`review-${Date.now()}`),
    missed,
  )
  session.startPractice('review', questions, { topic: 'all', length: questions.length, onlyMissed: true })
})

onBeforeRouteLeave(() => {
  session.clearPractice()
  return true
})
</script>

<template>
  <div v-if="progress.missedCount === 0 && !session.practice" class="card center stack">
    <h2>Nothing to review 🎉</h2>
    <p class="muted">You have no missed questions right now. Take an exam or practice to find weak spots.</p>
    <RouterLink to="/exam" class="btn">Take an exam</RouterLink>
  </div>

  <PracticeRunner v-else>
    <template #done>
      <RouterLink to="/" class="btn btn--block">Back to home</RouterLink>
    </template>
  </PracticeRunner>
</template>
