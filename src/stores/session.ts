import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PreparedQuestion, PracticeConfig, AnswerMap } from '@/types/exam'

export type ExamPhase = 'part1' | 'part2' | 'result'

export interface ExamSession {
  id: string
  sign: PreparedQuestion[]
  general: PreparedQuestion[]
  answers: AnswerMap
  phase: ExamPhase
  /** Set once the exam is graded so the result page can be revisited. */
  resultId: string | null
}

export interface PracticeSession {
  kind: 'practice' | 'review'
  questions: PreparedQuestion[]
  answers: AnswerMap
  index: number
  config: PracticeConfig
}

/** Holds the transient active run; persisted so a mid-exam refresh restores. */
export const useSessionStore = defineStore(
  'session',
  () => {
    const exam = ref<ExamSession | null>(null)
    const practice = ref<PracticeSession | null>(null)

    const hasActiveExam = computed(() => exam.value !== null && exam.value.phase !== 'result')
    const hasActivePractice = computed(() => practice.value !== null)

    // ---- exam ------------------------------------------------------------
    function startExam(id: string, sign: PreparedQuestion[], general: PreparedQuestion[]): void {
      exam.value = { id, sign, general, answers: {}, phase: 'part1', resultId: null }
    }
    function answerExam(questionId: string, choiceIndex: number): void {
      if (exam.value) exam.value.answers[questionId] = choiceIndex
    }
    function setExamPhase(phase: ExamPhase): void {
      if (exam.value) exam.value.phase = phase
    }
    function setExamResult(resultId: string): void {
      if (exam.value) {
        exam.value.resultId = resultId
        exam.value.phase = 'result'
      }
    }
    function clearExam(): void {
      exam.value = null
    }

    // ---- practice / review ----------------------------------------------
    function startPractice(
      kind: 'practice' | 'review',
      questions: PreparedQuestion[],
      config: PracticeConfig,
    ): void {
      practice.value = { kind, questions, answers: {}, index: 0, config }
    }
    function answerPractice(questionId: string, choiceIndex: number): void {
      if (practice.value) practice.value.answers[questionId] = choiceIndex
    }
    function setPracticeIndex(index: number): void {
      if (practice.value) practice.value.index = index
    }
    function clearPractice(): void {
      practice.value = null
    }

    return {
      exam,
      practice,
      hasActiveExam,
      hasActivePractice,
      startExam,
      answerExam,
      setExamPhase,
      setExamResult,
      clearExam,
      startPractice,
      answerPractice,
      setPracticeIndex,
      clearPractice,
    }
  },
  {
    persist: {
      key: 'vadmv:v1:session',
    },
  },
)
