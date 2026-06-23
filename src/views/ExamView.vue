<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useContentStore } from '@/stores/content'
import { useSessionStore } from '@/stores/session'
import { useProgressStore, type Attempt } from '@/stores/progress'
import { selectExamQuestions } from '@/lib/selection'
import { gradeSignPart, gradeExam } from '@/lib/scoring'
import { rngFromSeed } from '@/lib/shuffle'
import { uid } from '@/lib/id'
import { VA_EXAM_CONFIG } from '@/types/exam'
import type { PreparedQuestion } from '@/types/exam'
import QuestionCard from '@/components/question/QuestionCard.vue'
import ExamProgress from '@/components/exam/ExamProgress.vue'
import Part1Gate from '@/components/exam/Part1Gate.vue'

const content = useContentStore()
const session = useSessionStore()
const progress = useProgressStore()
const router = useRouter()

type UiState = 'quiz' | 'gate'
const ui = ref<UiState>('quiz')
const index = ref(0)

function startNewExam(): void {
  const rng = rngFromSeed(`exam-${Date.now()}`)
  const prepared = selectExamQuestions(content.questions, VA_EXAM_CONFIG, rng)
  session.startExam(uid(), prepared.sign, prepared.general)
  ui.value = 'quiz'
  index.value = 0
}

onMounted(() => {
  const ex = session.exam
  if (!ex || ex.phase === 'result') {
    startNewExam()
    return
  }
  // Resume: if Part 1 is fully answered, show the gate again (refresh-safe).
  if (ex.phase === 'part1' && ex.sign.every((q) => ex.answers[q.id] !== undefined)) {
    ui.value = 'gate'
  } else {
    index.value = 0
  }
})

const exam = computed(() => session.exam)
const part = computed<1 | 2>(() => (exam.value?.phase === 'part2' ? 2 : 1))
const questions = computed<PreparedQuestion[]>(() =>
  part.value === 1 ? (exam.value?.sign ?? []) : (exam.value?.general ?? []),
)
const current = computed(() => questions.value[index.value])
const selected = computed(() =>
  current.value ? (exam.value?.answers[current.value.id] ?? null) : null,
)
const answeredAll = computed(() =>
  questions.value.length > 0 && questions.value.every((q) => exam.value?.answers[q.id] !== undefined),
)
const isLast = computed(() => index.value === questions.value.length - 1)

const signGate = computed(() =>
  gradeSignPart(exam.value?.sign ?? [], exam.value?.answers ?? {}),
)

function select(choiceIndex: number): void {
  if (current.value) session.answerExam(current.value.id, choiceIndex)
}

function next(): void {
  if (!isLast.value) index.value++
}
function prev(): void {
  if (index.value > 0) index.value--
}

function attemptsFor(qs: PreparedQuestion[]): Attempt[] {
  return qs.map((q) => ({ question: q, selectedIndex: exam.value?.answers[q.id] ?? null }))
}

function submitPart1(): void {
  if (!exam.value) return
  progress.recordAttempt(attemptsFor(exam.value.sign))
  if (!signGate.value.passed) {
    // Failing Part 1 ends the exam and is recorded as a failed attempt.
    finishExam()
  } else {
    ui.value = 'gate'
  }
}

function advanceToPart2(): void {
  session.setExamPhase('part2')
  ui.value = 'quiz'
  index.value = 0
}

function finishExam(): void {
  if (!exam.value) return
  // Record general attempts only if Part 2 was reached.
  if (exam.value.phase === 'part2') progress.recordAttempt(attemptsFor(exam.value.general))
  const result = gradeExam(
    exam.value.sign,
    exam.value.phase === 'part2' ? exam.value.general : [],
    exam.value.answers,
    VA_EXAM_CONFIG,
    Date.now(),
    exam.value.id,
  )
  progress.recordExamResult(result)
  session.setExamResult(result.id)
  router.push({ name: 'exam-result', params: { id: result.id } })
}

// In-app leave confirmation (replaces the blocking native confirm()).
const hasAnswered = computed(() => Object.keys(exam.value?.answers ?? {}).length > 0)
const leaveResolve = ref<((ok: boolean) => void) | null>(null)
const showLeaveModal = computed(() => leaveResolve.value !== null)

function resolveLeave(ok: boolean): void {
  const resolve = leaveResolve.value
  leaveResolve.value = null
  if (ok) session.clearExam()
  resolve?.(ok)
}

onBeforeRouteLeave((to) => {
  if (to.name === 'exam-result') return true
  if (!session.hasActiveExam || ui.value !== 'quiz') return true
  // Nothing answered yet — leave freely and drop the empty attempt.
  if (!hasAnswered.value) {
    session.clearExam()
    return true
  }
  // Otherwise ask with a styled modal; the promise settles on the user's choice.
  return new Promise<boolean>((resolve) => {
    leaveResolve.value = resolve
  })
})
</script>

<template>
  <div v-if="exam" class="stack">
    <Part1Gate
      v-if="ui === 'gate'"
      :correct="signGate.correct"
      :total="signGate.total"
      @advance="advanceToPart2"
      @restart="startNewExam"
    />

    <template v-else-if="current">
      <ExamProgress :part="part" :index="index" :total="questions.length" />
      <QuestionCard :question="current" :selected-index="selected" @select="select" />

      <div class="row exam-nav">
        <button class="btn btn--ghost" :disabled="index === 0" @click="prev">Back</button>

        <button
          v-if="!isLast"
          class="btn"
          :disabled="selected === null"
          @click="next"
        >
          Next
        </button>
        <button
          v-else-if="part === 1"
          class="btn btn--green"
          :disabled="!answeredAll"
          @click="submitPart1"
        >
          Submit Part 1
        </button>
        <button v-else class="btn btn--green" :disabled="!answeredAll" @click="finishExam">
          Finish exam
        </button>
      </div>
      <p v-if="isLast && !answeredAll" class="muted center">
        Answer every question to finish this part.
      </p>
    </template>
  </div>

  <Teleport to="body">
    <div
      v-if="showLeaveModal"
      class="leave-backdrop"
      @click.self="resolveLeave(false)"
      @keydown.esc="resolveLeave(false)"
    >
      <div class="leave-modal card" role="dialog" aria-modal="true" aria-labelledby="leave-title">
        <h2 id="leave-title" class="leave-modal__title">Leave the exam?</h2>
        <p class="muted">Your progress on this attempt won't be saved.</p>
        <div class="leave-modal__actions">
          <button class="btn btn--ghost" autofocus @click="resolveLeave(false)">Keep going</button>
          <button class="btn btn--green" @click="resolveLeave(true)">Leave exam</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.exam-nav {
  justify-content: space-between;
  gap: 10px;
}
.exam-nav .btn {
  flex: 1;
}
/* primary action gets more weight than Back */
.exam-nav .btn:last-child {
  flex: 1.6;
}

.leave-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 27, 45, 0.55);
  backdrop-filter: blur(2px);
  animation: leave-fade 0.15s ease;
}
.leave-modal {
  width: min(100%, 380px);
  text-align: center;
  animation: leave-pop 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.leave-modal__title {
  font-size: 1.3rem;
  margin-bottom: 6px;
}
.leave-modal__actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}
.leave-modal__actions .btn {
  flex: 1;
}
@keyframes leave-fade {
  from {
    opacity: 0;
  }
}
@keyframes leave-pop {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
}
@media (prefers-reduced-motion: reduce) {
  .leave-backdrop,
  .leave-modal {
    animation: none;
  }
}
</style>
