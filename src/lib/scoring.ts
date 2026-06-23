import type { Question } from '@/types/question'
import type { AnswerMap, ExamConfig, ExamResult, PartResult } from '@/types/exam'

function countCorrect(questions: Question[], answers: AnswerMap): number {
  let correct = 0
  for (const q of questions) {
    if (answers[q.id] === q.answerIndex) correct++
  }
  return correct
}

function pct(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100)
}

/** Part 1: must answer ALL signs correctly to pass/advance. */
export function gradeSignPart(questions: Question[], answers: AnswerMap): PartResult {
  const total = questions.length
  const correct = countCorrect(questions, answers)
  return { total, correct, pct: pct(correct, total), passed: total > 0 && correct === total }
}

/** Part 2: pass at >= passPct (e.g. 80% — exactly 80 passes, 79 fails). */
export function gradeGeneralPart(
  questions: Question[],
  answers: AnswerMap,
  passPct: number,
): PartResult {
  const total = questions.length
  const correct = countCorrect(questions, answers)
  const p = pct(correct, total)
  return { total, correct, pct: p, passed: p >= passPct }
}

export function byTopicBreakdown(
  questions: Question[],
  answers: AnswerMap,
): Record<string, { correct: number; total: number }> {
  const out: Record<string, { correct: number; total: number }> = {}
  for (const q of questions) {
    const stat = (out[q.topic] ??= { correct: 0, total: 0 })
    stat.total++
    if (answers[q.id] === q.answerIndex) stat.correct++
  }
  return out
}

/** Grade a complete exam attempt. Overall pass requires BOTH parts to pass. */
export function gradeExam(
  signQuestions: Question[],
  generalQuestions: Question[],
  answers: AnswerMap,
  config: ExamConfig,
  now: number,
  id: string,
): ExamResult {
  const signPart = gradeSignPart(signQuestions, answers)
  const generalPart = gradeGeneralPart(generalQuestions, answers, config.generalPassPct)
  return {
    id,
    takenAt: now,
    signPart,
    generalPart,
    passed: signPart.passed && generalPart.passed,
    byTopic: byTopicBreakdown(generalQuestions, answers),
  }
}
