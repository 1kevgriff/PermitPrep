export type DeckId = 'signs' | 'facts'

export interface FlashCard {
  id: string
  deck: DeckId
  /** Image src for sign cards; undefined for fact cards. */
  image?: string
  front: string
  back: string
}

/** Leitner-box progress for one card. */
export interface CardProgress {
  box: number // 1..5
  lastReviewedAt: number | null
}

export type Rating = 'gotIt' | 'review'
