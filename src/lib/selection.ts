import type { Question } from '@/types/question'
import type { ExamConfig, PracticeConfig, PreparedExam, PreparedQuestion } from '@/types/exam'
import { shuffle, type Rng } from './shuffle'

/**
 * Return a clone of the question with its choices shuffled and answerIndex
 * remapped to the new position of the correct choice.
 */
export function permuteChoices(q: Question, rng: Rng): PreparedQuestion {
  const correct = q.choices[q.answerIndex]
  const choices = shuffle(q.choices, rng)
  return { ...q, choices, answerIndex: choices.indexOf(correct) }
}

function partition(bank: Question[]): { sign: Question[]; general: Question[] } {
  const sign: Question[] = []
  const general: Question[] = []
  for (const q of bank) (q.type === 'sign' ? sign : general).push(q)
  return { sign, general }
}

/**
 * Pick `count` questions spread as evenly as possible across topics
 * (round-robin over shuffled per-topic buckets).
 */
function stratifiedSample(questions: Question[], count: number, rng: Rng): Question[] {
  const byTopic = new Map<string, Question[]>()
  for (const q of shuffle(questions, rng)) {
    const bucket = byTopic.get(q.topic) ?? []
    bucket.push(q)
    byTopic.set(q.topic, bucket)
  }
  const buckets = shuffle([...byTopic.values()], rng)
  const picked: Question[] = []
  let progressed = true
  while (picked.length < count && progressed) {
    progressed = false
    for (const bucket of buckets) {
      const next = bucket.shift()
      if (next) {
        picked.push(next)
        progressed = true
        if (picked.length === count) break
      }
    }
  }
  return picked
}

/** Build a full exam: Part 1 signs + Part 2 stratified general, choices permuted. */
export function selectExamQuestions(
  bank: Question[],
  config: ExamConfig,
  rng: Rng,
): PreparedExam {
  const { sign, general } = partition(bank)
  const signPicked = shuffle(sign, rng).slice(0, config.signCount)
  const generalPicked = stratifiedSample(general, config.generalCount, rng)
  return {
    sign: signPicked.map((q) => permuteChoices(q, rng)),
    general: generalPicked.map((q) => permuteChoices(q, rng)),
  }
}

/**
 * Practice / Review selection. `onlyMissed` filters to the supplied missed-id
 * set (powers Review Missed). Topic 'all' = any, 'signs' = sign questions.
 */
export function selectPracticeQuestions(
  bank: Question[],
  config: PracticeConfig,
  rng: Rng,
  missedIds: ReadonlySet<string> = new Set(),
): PreparedQuestion[] {
  let pool = bank
  if (config.onlyMissed) pool = pool.filter((q) => missedIds.has(q.id))
  if (config.topic === 'signs') pool = pool.filter((q) => q.type === 'sign')
  else if (config.topic !== 'all') pool = pool.filter((q) => q.topic === config.topic)

  const picked = shuffle(pool, rng).slice(0, config.length)
  return picked.map((q) => permuteChoices(q, rng))
}
