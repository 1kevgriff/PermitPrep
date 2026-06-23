import type { GeneralQuestion, Question, SignQuestion } from '@/types/question'

export function makeGeneral(
  id: string,
  topic: string,
  answerIndex = 0,
): GeneralQuestion {
  return {
    id,
    type: 'general',
    topic,
    prompt: `Q ${id}?`,
    choices: ['a', 'b', 'c', 'd'],
    answerIndex,
    explanation: 'because',
    manualRef: { sectionSlug: 'testing' },
  }
}

export function makeSign(id: string, answerIndex = 0): SignQuestion {
  return {
    id,
    type: 'sign',
    topic: 'signs',
    signId: id,
    image: `images/signs/${id}.png`,
    prompt: 'What does this sign mean?',
    choices: ['a', 'b', 'c', 'd'],
    answerIndex,
    explanation: 'because',
    manualRef: { sectionSlug: 'signals-signs-and-pavement-markings' },
  }
}

export function makeBank(signCount: number, topics: string[], perTopic: number): Question[] {
  const bank: Question[] = []
  for (let i = 0; i < signCount; i++) bank.push(makeSign(`sign-${i}`))
  for (const topic of topics) {
    for (let i = 0; i < perTopic; i++) bank.push(makeGeneral(`${topic}-${i}`, topic))
  }
  return bank
}
