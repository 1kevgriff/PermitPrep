import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Question } from '@/types/question'
import type { ExamResult } from '@/types/exam'
import type { CardProgress } from '@/types/flashcard'
import {
  emptyProgress,
  PROGRESS_SCHEMA_VERSION,
  type ProgressState,
} from '@/types/progress'

const MAX_HISTORY = 50

export interface Attempt {
  question: Pick<Question, 'id' | 'topic' | 'answerIndex'>
  selectedIndex: number | null
}

export interface WeakTopic {
  topic: string
  correct: number
  total: number
  pct: number
}

export const useProgressStore = defineStore(
  'progress',
  () => {
    const state = ref<ProgressState>(emptyProgress())

    /** Reset to a clean schema-correct state (used on corrupt/old data). */
    function reset(): void {
      state.value = emptyProgress()
    }

    /** Record one or more answered questions (exam or practice). */
    function recordAttempt(attempts: Attempt[], now: number = Date.now()): void {
      for (const { question, selectedIndex } of attempts) {
        const stat = (state.value.topicStats[question.topic] ??= {
          correct: 0,
          total: 0,
        })
        stat.total++
        const correct = selectedIndex === question.answerIndex
        if (correct) {
          stat.correct++
          delete state.value.missed[question.id]
        } else {
          state.value.missed[question.id] = {
            questionId: question.id,
            topic: question.topic,
            missedAt: now,
          }
        }
      }
    }

    function recordExamResult(result: ExamResult): void {
      state.value.examResults.unshift(result)
      if (state.value.examResults.length > MAX_HISTORY) {
        state.value.examResults.length = MAX_HISTORY
      }
    }

    function updateCard(cardId: string, progress: CardProgress): void {
      state.value.cards[cardId] = progress
    }

    function clearMissed(): void {
      state.value.missed = {}
    }

    // ---- getters ---------------------------------------------------------
    const examResults = computed(() => state.value.examResults)
    const lastResult = computed<ExamResult | null>(() => state.value.examResults[0] ?? null)
    const attemptsCount = computed(() => state.value.examResults.length)

    const passRate = computed(() => {
      const results = state.value.examResults
      if (results.length === 0) return 0
      const passed = results.filter((r) => r.passed).length
      return Math.round((passed / results.length) * 100)
    })

    const bestGeneralPct = computed(() => {
      let best = 0
      for (const r of state.value.examResults) best = Math.max(best, r.generalPart.pct)
      return best
    })

    const missedIds = computed(() => new Set(Object.keys(state.value.missed)))
    const missedCount = computed(() => missedIds.value.size)

    /** Topics sorted worst-first (>= 3 attempts), for the dashboard. */
    const weakestTopics = computed<WeakTopic[]>(() => {
      const out: WeakTopic[] = []
      for (const [topic, s] of Object.entries(state.value.topicStats)) {
        if (s.total < 3) continue
        out.push({
          topic,
          correct: s.correct,
          total: s.total,
          pct: Math.round((s.correct / s.total) * 100),
        })
      }
      return out.sort((a, b) => a.pct - b.pct)
    })

    const cards = computed(() => state.value.cards)

    return {
      state,
      reset,
      recordAttempt,
      recordExamResult,
      updateCard,
      clearMissed,
      examResults,
      lastResult,
      attemptsCount,
      passRate,
      bestGeneralPct,
      missedIds,
      missedCount,
      weakestTopics,
      cards,
    }
  },
  {
    persist: {
      key: 'vadmv:v1:progress',
      afterHydrate(ctx) {
        // Defend against corrupt or out-of-date persisted data.
        const s = ctx.store.state as ProgressState | undefined
        if (!s || s.schemaVersion !== PROGRESS_SCHEMA_VERSION || !Array.isArray(s.examResults)) {
          ctx.store.reset()
        }
      },
    },
  },
)
