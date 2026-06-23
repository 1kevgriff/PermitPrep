/** A reference back into the manual so every question is sourced. */
export interface ManualRef {
  sectionSlug: string
}

export interface BaseQuestion {
  id: string
  topic: string
  prompt: string
  choices: string[]
  answerIndex: number
  explanation: string
  manualRef: ManualRef
}

/** Image-based "what does this sign mean?" question (exam Part 1). */
export interface SignQuestion extends BaseQuestion {
  type: 'sign'
  signId: string
  image: string
}

/** Text-only general-knowledge question (exam Part 2). */
export interface GeneralQuestion extends BaseQuestion {
  type: 'general'
}

export type Question = SignQuestion | GeneralQuestion

export interface QuestionBank {
  version: number
  questions: Question[]
}

export function isSignQuestion(q: Question): q is SignQuestion {
  return q.type === 'sign'
}
