<script setup lang="ts">
import type { PreparedQuestion } from '@/types/exam'
import SignImage from './SignImage.vue'
import ChoiceList from './ChoiceList.vue'
import ExplanationPanel from './ExplanationPanel.vue'

defineProps<{
  question: PreparedQuestion
  selectedIndex: number | null
  /** Practice mode reveals correctness + explanation after answering. */
  revealed?: boolean
}>()

const emit = defineEmits<{ select: [index: number] }>()
</script>

<template>
  <div class="card qcard">
    <SignImage
      v-if="question.type === 'sign'"
      :src="question.image"
      alt="Traffic sign to identify"
    />
    <h2 class="qcard__prompt">{{ question.prompt }}</h2>
    <ChoiceList
      :choices="question.choices"
      :selected-index="selectedIndex"
      :answer-index="question.answerIndex"
      :revealed="revealed"
      @select="emit('select', $event)"
    />
    <ExplanationPanel
      v-if="revealed && selectedIndex !== null"
      :correct="selectedIndex === question.answerIndex"
      :explanation="question.explanation"
      :section-slug="question.manualRef.sectionSlug"
    />
  </div>
</template>

<style scoped>
.qcard {
  animation: rise 0.25s ease both;
}
.qcard__prompt {
  font-size: 1.28rem;
  font-weight: 700;
  margin-bottom: 16px;
}
</style>
