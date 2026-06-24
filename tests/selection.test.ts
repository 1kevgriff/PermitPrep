import { describe, it, expect } from 'vitest'
import { selectExamQuestions, selectPracticeQuestions, permuteChoices } from '@/lib/selection'
import { mulberry32, rngFromSeed } from '@/lib/shuffle'
import { VA_EXAM_CONFIG } from './examConfig'
import { makeBank, makeSign } from './helpers'

const TOPICS = ['signals', 'right-of-way', 'speed', 'passing', 'sharing', 'hazards']

describe('selectExamQuestions', () => {
  const bank = makeBank(20, TOPICS, 8) // 20 signs, 48 general

  it('returns the configured counts', () => {
    const exam = selectExamQuestions(bank, VA_EXAM_CONFIG, mulberry32(1))
    expect(exam.sign).toHaveLength(10)
    expect(exam.general).toHaveLength(25)
  })

  it('has no duplicate questions within a part', () => {
    const exam = selectExamQuestions(bank, VA_EXAM_CONFIG, mulberry32(2))
    expect(new Set(exam.sign.map((q) => q.id)).size).toBe(10)
    expect(new Set(exam.general.map((q) => q.id)).size).toBe(25)
  })

  it('Part 1 is all signs, Part 2 is all general', () => {
    const exam = selectExamQuestions(bank, VA_EXAM_CONFIG, mulberry32(3))
    expect(exam.sign.every((q) => q.type === 'sign')).toBe(true)
    expect(exam.general.every((q) => q.type === 'general')).toBe(true)
  })

  it('spreads Part 2 across topics (stratified)', () => {
    const exam = selectExamQuestions(bank, VA_EXAM_CONFIG, mulberry32(4))
    const topics = new Set(exam.general.map((q) => q.topic))
    // 25 across 6 topics with 8 each -> every topic represented
    expect(topics.size).toBe(TOPICS.length)
  })

  it('does not crash on an insufficient bank', () => {
    const small = makeBank(3, ['signals'], 4)
    const exam = selectExamQuestions(small, VA_EXAM_CONFIG, mulberry32(5))
    expect(exam.sign.length).toBeLessThanOrEqual(3)
    expect(exam.general.length).toBeLessThanOrEqual(4)
  })
})

describe('permuteChoices', () => {
  it('keeps the correct answer text aligned with the remapped answerIndex', () => {
    const q = makeSign('s1', 2)
    for (let seed = 0; seed < 50; seed++) {
      const p = permuteChoices(q, mulberry32(seed))
      expect(p.choices[p.answerIndex]).toBe(q.choices[q.answerIndex])
      expect(p.choices.slice().sort()).toEqual(q.choices.slice().sort())
    }
  })
})

describe('selectPracticeQuestions', () => {
  const bank = makeBank(10, TOPICS, 8)

  it('filters by topic and respects length', () => {
    const out = selectPracticeQuestions(bank, { topic: 'speed', length: 5 }, mulberry32(1))
    expect(out).toHaveLength(5)
    expect(out.every((q) => q.topic === 'speed')).toBe(true)
  })

  it("topic 'signs' returns only sign questions", () => {
    const out = selectPracticeQuestions(bank, { topic: 'signs', length: 6 }, mulberry32(1))
    expect(out.every((q) => q.type === 'sign')).toBe(true)
  })

  it('onlyMissed restricts to the missed id set', () => {
    const missed = new Set(['speed-0', 'sharing-1'])
    const out = selectPracticeQuestions(
      bank,
      { topic: 'all', length: 10, onlyMissed: true },
      rngFromSeed('rev'),
      missed,
    )
    expect(out.map((q) => q.id).sort()).toEqual(['sharing-1', 'speed-0'])
  })
})
