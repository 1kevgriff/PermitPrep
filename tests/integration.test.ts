import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createApp } from 'vue'
import { readFileSync } from 'node:fs'
import { persistPlugin } from '@/stores/persist'
import { useContentStore } from '@/stores/content'
import { useProgressStore } from '@/stores/progress'
import { selectExamQuestions, selectPracticeQuestions } from '@/lib/selection'
import { gradeExam } from '@/lib/scoring'
import { rngFromSeed } from '@/lib/shuffle'
import { VA_EXAM_CONFIG, type AnswerMap } from '@/types/exam'

const root = process.cwd() + '/'
function fixture(file: string): string {
  return readFileSync(root + 'public/data/' + file, 'utf8')
}

// Serve the real /public/data JSON to the content loaders.
beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const file = url.split('/data/')[1]
      return { ok: true, json: async () => JSON.parse(fixture(file)) } as Response
    }),
  )
  const pinia = createPinia()
  pinia.use(persistPlugin)
  createApp({}).use(pinia)
  setActivePinia(pinia)
})

describe('end-to-end with the real content bundle', () => {
  it('loads and indexes the shipped data', async () => {
    const content = useContentStore()
    await content.ensureLoaded()
    expect(content.loaded).toBe(true)
    expect(content.signQuestions.length).toBeGreaterThanOrEqual(10)
    expect(content.generalQuestions.length).toBeGreaterThanOrEqual(25)
    expect(content.sections).toHaveLength(8)
    expect(content.signCards.length).toBe(content.signs.length)
  })

  it('builds a real 10+25 exam, grades a perfect run, and records a pass', async () => {
    const content = useContentStore()
    const progress = useProgressStore()
    await content.ensureLoaded()

    const exam = selectExamQuestions(content.questions, VA_EXAM_CONFIG, rngFromSeed('e2e-pass'))
    expect(exam.sign).toHaveLength(10)
    expect(exam.general).toHaveLength(25)

    const answers: AnswerMap = {}
    for (const q of [...exam.sign, ...exam.general]) answers[q.id] = q.answerIndex

    const result = gradeExam(exam.sign, exam.general, answers, VA_EXAM_CONFIG, Date.now(), 'e2e')
    progress.recordAttempt([...exam.sign, ...exam.general].map((q) => ({ question: q, selectedIndex: answers[q.id] })))
    progress.recordExamResult(result)

    expect(result.passed).toBe(true)
    expect(progress.passRate).toBe(100)
    expect(progress.missedCount).toBe(0)
  })

  it('fails Part 1 when a sign is wrong (exam ends, recorded as fail)', async () => {
    const content = useContentStore()
    const progress = useProgressStore()
    await content.ensureLoaded()

    const exam = selectExamQuestions(content.questions, VA_EXAM_CONFIG, rngFromSeed('e2e-fail'))
    const answers: AnswerMap = {}
    exam.sign.forEach((q, i) => (answers[q.id] = i === 0 ? (q.answerIndex + 1) % 4 : q.answerIndex))

    progress.recordAttempt(exam.sign.map((q) => ({ question: q, selectedIndex: answers[q.id] })))
    const result = gradeExam(exam.sign, [], answers, VA_EXAM_CONFIG, Date.now(), 'e2e-f')
    progress.recordExamResult(result)

    expect(result.signPart.passed).toBe(false)
    expect(result.passed).toBe(false)
    expect(progress.missedCount).toBe(1) // the one wrong sign is now review-able
  })

  it('Review Missed replays exactly the missed questions', async () => {
    const content = useContentStore()
    const progress = useProgressStore()
    await content.ensureLoaded()

    // miss two specific general questions
    const targets = content.generalQuestions.slice(0, 2)
    progress.recordAttempt(targets.map((q) => ({ question: q, selectedIndex: (q.answerIndex + 1) % 4 })))
    expect(progress.missedCount).toBe(2)

    const review = selectPracticeQuestions(
      content.questions,
      { topic: 'all', length: 99, onlyMissed: true },
      rngFromSeed('rev'),
      progress.missedIds,
    )
    expect(review.map((q) => q.id).sort()).toEqual(targets.map((q) => q.id).sort())
  })
})
