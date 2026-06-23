import type { CardProgress, FlashCard, Rating } from '@/types/flashcard'

export const MAX_BOX = 5
export const MIN_BOX = 1

/** Time a card in box N must wait before it is due again (index by box-1). */
export const INTERVALS_MS = [
  0, //               box 1 — due immediately
  10 * 60_000, //     box 2 — 10 minutes
  24 * 3_600_000, //  box 3 — 1 day
  3 * 24 * 3_600_000, // box 4 — 3 days
  7 * 24 * 3_600_000, // box 5 — 7 days
]

export function initialCardProgress(): CardProgress {
  return { box: MIN_BOX, lastReviewedAt: null }
}

function clampBox(box: number): number {
  return Math.max(MIN_BOX, Math.min(MAX_BOX, box))
}

/** Apply a rating: "got it" promotes a box, "review" demotes one (clamped). */
export function rateCard(progress: CardProgress, rating: Rating, now: number): CardProgress {
  const delta = rating === 'gotIt' ? 1 : -1
  return { box: clampBox(progress.box + delta), lastReviewedAt: now }
}

export function dueAt(progress: CardProgress): number {
  if (progress.lastReviewedAt === null) return 0 // never seen -> due now
  return progress.lastReviewedAt + INTERVALS_MS[progress.box - 1]
}

export function isDue(progress: CardProgress, now: number): boolean {
  return dueAt(progress) <= now
}

function progressFor(
  card: FlashCard,
  map: Record<string, CardProgress>,
): CardProgress {
  return map[card.id] ?? initialCardProgress()
}

/**
 * Order a deck for study: due cards first (lowest box first, then soonest-due),
 * then top up with not-yet-due cards ordered by how soon they come due. Cards in
 * box 1 (just missed / never seen) that are due sort to the front of the due set.
 */
export function orderDeck(
  cards: FlashCard[],
  progressMap: Record<string, CardProgress>,
  now: number,
): FlashCard[] {
  const due: FlashCard[] = []
  const notDue: FlashCard[] = []
  for (const card of cards) {
    ;(isDue(progressFor(card, progressMap), now) ? due : notDue).push(card)
  }
  const box = (c: FlashCard) => progressFor(c, progressMap).box
  due.sort((a, b) => box(a) - box(b) || dueAt(progressFor(a, progressMap)) - dueAt(progressFor(b, progressMap)))
  notDue.sort((a, b) => dueAt(progressFor(a, progressMap)) - dueAt(progressFor(b, progressMap)))
  return [...due, ...notDue]
}
