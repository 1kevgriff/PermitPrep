import { describe, it, expect } from 'vitest'
import { gradeSignPart, gradeGeneralPart, gradeExam } from '@/lib/scoring'
import { VA_EXAM_CONFIG } from './examConfig'
import type { AnswerMap } from '@/types/exam'
import { makeGeneral, makeSign } from './helpers'

function answersAllCorrect(qs: { id: string; answerIndex: number }[]): AnswerMap {
  return Object.fromEntries(qs.map((q) => [q.id, q.answerIndex]))
}

describe('gradeSignPart (Part 1 gate)', () => {
  const signs = Array.from({ length: 10 }, (_, i) => makeSign(`s${i}`, i % 4))

  it('passes only when all are correct', () => {
    expect(gradeSignPart(signs, answersAllCorrect(signs)).passed).toBe(true)
  })

  it('fails if even one is wrong', () => {
    const a = answersAllCorrect(signs)
    a[signs[3].id] = (signs[3].answerIndex + 1) % 4
    const r = gradeSignPart(signs, a)
    expect(r.passed).toBe(false)
    expect(r.correct).toBe(9)
  })
})

describe('gradeGeneralPart (80% boundary)', () => {
  const qs = Array.from({ length: 25 }, (_, i) => makeGeneral(`g${i}`, 't', i % 4))

  it('20/25 = 80% passes', () => {
    const a = answersAllCorrect(qs)
    // make 5 wrong -> 20 correct
    for (let i = 0; i < 5; i++) a[qs[i].id] = (qs[i].answerIndex + 1) % 4
    const r = gradeGeneralPart(qs, a, VA_EXAM_CONFIG.generalPassPct)
    expect(r.correct).toBe(20)
    expect(r.pct).toBe(80)
    expect(r.passed).toBe(true)
  })

  it('19/25 = 76% fails', () => {
    const a = answersAllCorrect(qs)
    for (let i = 0; i < 6; i++) a[qs[i].id] = (qs[i].answerIndex + 1) % 4
    const r = gradeGeneralPart(qs, a, VA_EXAM_CONFIG.generalPassPct)
    expect(r.correct).toBe(19)
    expect(r.passed).toBe(false)
  })

  it('exactly the threshold percentage passes', () => {
    const five = Array.from({ length: 5 }, (_, i) => makeGeneral(`h${i}`, 't', 0))
    const a = answersAllCorrect(five)
    a[five[0].id] = 1 // 4/5 = 80%
    expect(gradeGeneralPart(five, a, 80).passed).toBe(true)
  })
})

describe('gradeExam (overall)', () => {
  const signs = Array.from({ length: 10 }, (_, i) => makeSign(`s${i}`, 0))
  const general = Array.from({ length: 25 }, (_, i) => makeGeneral(`g${i}`, i % 2 ? 'a' : 'b', 0))

  it('requires BOTH parts to pass', () => {
    const all = { ...answersAllCorrect(signs), ...answersAllCorrect(general) }
    expect(gradeExam(signs, general, all, VA_EXAM_CONFIG, 1000, 'e1').passed).toBe(true)

    // fail one sign -> overall fail even with perfect general
    const failSign = { ...all, [signs[0].id]: 1 }
    expect(gradeExam(signs, general, failSign, VA_EXAM_CONFIG, 1000, 'e2').passed).toBe(false)
  })

  it('produces a per-topic breakdown for the general part', () => {
    const all = { ...answersAllCorrect(signs), ...answersAllCorrect(general) }
    const r = gradeExam(signs, general, all, VA_EXAM_CONFIG, 1000, 'e3')
    const totals = Object.values(r.byTopic).reduce((s, t) => s + t.total, 0)
    expect(totals).toBe(25)
  })
})
