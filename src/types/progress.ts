import type { ExamResult } from './exam'
import type { CardProgress } from './flashcard'

export const PROGRESS_SCHEMA_VERSION = 1

export interface MissedQuestion {
  questionId: string
  topic: string
  missedAt: number
}

export interface TopicStat {
  correct: number
  total: number
}

export interface ProgressState {
  schemaVersion: number
  examResults: ExamResult[]
  /** Cumulative answer tally per topic, across all modes. */
  topicStats: Record<string, TopicStat>
  /** Currently-missed questions, keyed by id (cleared once answered right). */
  missed: Record<string, MissedQuestion>
  /** Flash-card Leitner progress, keyed by card id. */
  cards: Record<string, CardProgress>
}

export function emptyProgress(): ProgressState {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    examResults: [],
    topicStats: {},
    missed: {},
    cards: {},
  }
}
