import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import type { QuestionBank } from '@/types/question'
import type { Manual, Sign } from '@/types/manual'

const root = process.cwd() + '/'
const read = (p: string) => JSON.parse(readFileSync(root + p, 'utf8'))

const bank: QuestionBank = read('public/data/va/questions.v1.json')
const manual: Manual = read('public/data/va/manual.v1.json')
const signs: Sign[] = read('public/data/signs.v1.json')

const sectionSlugs = new Set(manual.sections.map((s) => s.slug))
const signIds = new Set(signs.map((s) => s.signId))

describe('question bank integrity (mirrors validate_bank.py)', () => {
  it('has unique question ids', () => {
    const ids = bank.questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every question has 4 distinct non-empty choices and an in-range answer', () => {
    for (const q of bank.questions) {
      expect(q.choices).toHaveLength(4)
      expect(new Set(q.choices).size).toBe(4)
      expect(q.choices.every((c) => c.trim().length > 0)).toBe(true)
      expect(q.answerIndex).toBeGreaterThanOrEqual(0)
      expect(q.answerIndex).toBeLessThan(q.choices.length)
      expect(q.explanation.trim().length).toBeGreaterThan(0)
    }
  })

  it('every manualRef resolves to a real section', () => {
    for (const q of bank.questions) {
      expect(sectionSlugs.has(q.manualRef.sectionSlug)).toBe(true)
    }
  })

  it('every sign question references a real sign and an existing image', () => {
    for (const q of bank.questions) {
      if (q.type !== 'sign') continue
      expect(signIds.has(q.signId)).toBe(true)
      expect(existsSync(root + 'public/' + q.image)).toBe(true)
    }
  })

  it('has enough questions for a full exam', () => {
    const sign = bank.questions.filter((q) => q.type === 'sign').length
    const general = bank.questions.filter((q) => q.type === 'general').length
    expect(sign).toBeGreaterThanOrEqual(10)
    expect(general).toBeGreaterThanOrEqual(25)
  })

  it('covers each topic with at least 5 questions', () => {
    const byTopic = new Map<string, number>()
    for (const q of bank.questions) byTopic.set(q.topic, (byTopic.get(q.topic) ?? 0) + 1)
    for (const [, n] of byTopic) expect(n).toBeGreaterThanOrEqual(5)
  })
})
