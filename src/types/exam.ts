import type { Question } from './question'

/**
 * Exam structure for a state. The concrete values are data-driven — they live
 * in each state's `config.v1.json` (`exam`) and reach the app via the state
 * store, so no exam counts are hardcoded here.
 */
export interface ExamConfig {
  /** Part 1 — traffic signs. Must be answered ALL correct to advance. */
  signCount: number
  /** Part 2 — general knowledge. */
  generalCount: number
  /** Pass threshold for Part 2, as a percentage (>= passes). */
  generalPassPct: number
}

export interface PracticeConfig {
  /** Topic slug, 'signs', or 'all'. */
  topic: string
  length: number
  onlyMissed?: boolean
}

export type AnswerMap = Record<string, number>

export interface PartResult {
  total: number
  correct: number
  passed: boolean
  /** Integer percentage 0–100. */
  pct: number
}

export interface ExamResult {
  id: string
  takenAt: number
  signPart: PartResult
  generalPart: PartResult
  passed: boolean
  /** Per-topic correct/total for the general part (weak-topic analysis). */
  byTopic: Record<string, { correct: number; total: number }>
}

/** A question with its presented (possibly shuffled) choice order. */
export type PreparedQuestion = Question

export interface PreparedExam {
  sign: PreparedQuestion[]
  general: PreparedQuestion[]
}
