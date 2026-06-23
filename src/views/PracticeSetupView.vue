<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '@/stores/content'
import { useSessionStore } from '@/stores/session'
import { selectPracticeQuestions } from '@/lib/selection'
import { rngFromSeed } from '@/lib/shuffle'
import { topicLabel } from '@/lib/labels'

const content = useContentStore()
const session = useSessionStore()
const router = useRouter()

const topic = ref('all')
const length = ref(10)

const topicOptions = computed(() => [
  { value: 'all', label: 'All topics' },
  { value: 'signs', label: 'Traffic Signs (images)' },
  ...content.topics.map((t) => ({ value: t, label: topicLabel(t) })),
])

const lengths = [5, 10, 20]

const available = computed(() => {
  if (topic.value === 'all') return content.questions.length
  if (topic.value === 'signs') return content.signQuestions.length
  return content.questionsByTopic.get(topic.value)?.length ?? 0
})

function start(): void {
  const rng = rngFromSeed(`practice-${topic.value}-${Date.now()}`)
  const questions = selectPracticeQuestions(
    content.questions,
    { topic: topic.value, length: length.value },
    rng,
  )
  session.startPractice('practice', questions, { topic: topic.value, length: length.value })
  router.push({ name: 'practice-run' })
}
</script>

<template>
  <div class="stack">
    <div class="card stack">
      <h1>Practice</h1>
      <p class="muted">Answer at your own pace with instant feedback and explanations.</p>

      <label class="field">
        <span>Topic</span>
        <select v-model="topic" class="select">
          <option v-for="opt in topicOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>

      <div class="field">
        <span>How many questions?</span>
        <div class="row lengths">
          <button
            v-for="n in lengths"
            :key="n"
            class="btn"
            :class="length === n ? 'btn--green' : 'btn--ghost'"
            @click="length = n"
          >
            {{ n }}
          </button>
        </div>
      </div>

      <p class="muted">{{ available }} questions available in this topic.</p>
      <button class="btn btn--green btn--lg btn--block" :disabled="available === 0" @click="start">
        Start practice
      </button>
    </div>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: 8px;
}
.field > span {
  font-family: var(--font-display);
  font-weight: 600;
}
.select {
  min-height: var(--tap);
  border: 2px solid var(--line);
  border-radius: 14px;
  padding: 0 14px;
  font-family: var(--font-body);
  font-size: 1rem;
  background: var(--bg);
  color: var(--ink);
}
.select:focus {
  outline: none;
  border-color: var(--sky);
  background: #fff;
}
.lengths {
  gap: 10px;
}
.lengths .btn {
  flex: 1;
  min-width: 0;
}
</style>
