import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createApp } from 'vue'
import { persistPlugin } from '@/stores/persist'
import { useProgressStore } from '@/stores/progress'
import type { ExamResult } from '@/types/exam'
import { makeGeneral } from './helpers'

function freshPinia() {
  const pinia = createPinia()
  pinia.use(persistPlugin)
  // Pinia only applies plugins once the pinia is installed on an app.
  createApp({}).use(pinia)
  setActivePinia(pinia)
}

function examResult(passed: boolean, pct: number): ExamResult {
  return {
    id: `r-${Math.random()}`,
    takenAt: Date.now(),
    signPart: { total: 10, correct: passed ? 10 : 9, passed, pct: passed ? 100 : 90 },
    generalPart: { total: 25, correct: Math.round((pct / 100) * 25), passed, pct },
    passed,
    byTopic: {},
  }
}

describe('progress store', () => {
  beforeEach(() => {
    localStorage.clear()
    freshPinia()
  })

  it('records attempts into topic stats and the missed set', () => {
    const p = useProgressStore()
    p.recordAttempt([
      { question: makeGeneral('a', 'speed', 0), selectedIndex: 0 }, // correct
      { question: makeGeneral('b', 'speed', 1), selectedIndex: 0 }, // wrong
    ])
    expect(p.state.topicStats.speed).toEqual({ correct: 1, total: 2 })
    expect(p.missedIds.has('b')).toBe(true)
    expect(p.missedIds.has('a')).toBe(false)
  })

  it('clears a missed question once answered correctly', () => {
    const p = useProgressStore()
    const q = makeGeneral('b', 'speed', 1)
    p.recordAttempt([{ question: q, selectedIndex: 0 }])
    expect(p.missedCount).toBe(1)
    p.recordAttempt([{ question: q, selectedIndex: 1 }])
    expect(p.missedCount).toBe(0)
  })

  it('computes pass rate and best score from exam history', () => {
    const p = useProgressStore()
    p.recordExamResult(examResult(true, 88))
    p.recordExamResult(examResult(false, 72))
    expect(p.attemptsCount).toBe(2)
    expect(p.passRate).toBe(50)
    expect(p.bestGeneralPct).toBe(88)
    expect(p.lastResult?.generalPart.pct).toBe(72) // most recent first
  })

  it('surfaces weakest topics (min 3 attempts) worst-first', () => {
    const p = useProgressStore()
    for (let i = 0; i < 4; i++)
      p.recordAttempt([{ question: makeGeneral(`s${i}`, 'speed', 0), selectedIndex: i < 1 ? 0 : 1 }])
    for (let i = 0; i < 4; i++)
      p.recordAttempt([{ question: makeGeneral(`r${i}`, 'rules', 0), selectedIndex: 0 }])
    const weak = p.weakestTopics
    expect(weak[0].topic).toBe('speed')
    expect(weak[0].pct).toBeLessThan(weak[1].pct)
  })

  it('reset clears all progress', () => {
    const p = useProgressStore()
    p.recordExamResult(examResult(true, 90))
    p.reset()
    expect(p.attemptsCount).toBe(0)
    expect(p.missedCount).toBe(0)
  })

  it('round-trips through localStorage', async () => {
    const p = useProgressStore()
    p.recordExamResult(examResult(true, 84))
    await Promise.resolve() // let the persist subscription flush
    expect(window.localStorage.getItem('vadmv:v1:progress')).toContain('examResults')
    // New store instance hydrates the persisted data.
    freshPinia()
    const p2 = useProgressStore()
    expect(p2.attemptsCount).toBe(1)
  })

  it('resets cleanly when persisted data is corrupt/old', () => {
    localStorage.setItem('vadmv:v1:progress', JSON.stringify({ state: { schemaVersion: 999 } }))
    freshPinia()
    const p = useProgressStore()
    expect(p.state.schemaVersion).toBe(1)
    expect(p.attemptsCount).toBe(0)
  })
})
