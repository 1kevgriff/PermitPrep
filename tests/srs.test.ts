import { describe, it, expect } from 'vitest'
import {
  rateCard,
  dueAt,
  isDue,
  orderDeck,
  initialCardProgress,
  INTERVALS_MS,
  MAX_BOX,
  MIN_BOX,
} from '@/lib/srs'
import type { CardProgress, FlashCard } from '@/types/flashcard'

const card = (id: string): FlashCard => ({ id, deck: 'signs', front: id, back: 'b' })

describe('rateCard', () => {
  it('promotes on gotIt and clamps at MAX_BOX', () => {
    let p = initialCardProgress()
    for (let i = 0; i < 10; i++) p = rateCard(p, 'gotIt', i)
    expect(p.box).toBe(MAX_BOX)
  })

  it('demotes on review and clamps at MIN_BOX', () => {
    let p: CardProgress = { box: 3, lastReviewedAt: 0 }
    p = rateCard(p, 'review', 100)
    expect(p.box).toBe(2)
    p = rateCard(p, 'review', 200)
    p = rateCard(p, 'review', 300)
    expect(p.box).toBe(MIN_BOX)
    expect(p.lastReviewedAt).toBe(300)
  })
})

describe('dueAt / isDue', () => {
  it('a never-reviewed card is due immediately', () => {
    expect(dueAt(initialCardProgress())).toBe(0)
    expect(isDue(initialCardProgress(), 0)).toBe(true)
  })

  it('computes due time from lastReviewedAt + interval for the box', () => {
    const p: CardProgress = { box: 3, lastReviewedAt: 1_000 }
    expect(dueAt(p)).toBe(1_000 + INTERVALS_MS[2])
    expect(isDue(p, 1_000)).toBe(false)
    expect(isDue(p, 1_000 + INTERVALS_MS[2])).toBe(true)
  })
})

describe('orderDeck', () => {
  it('puts due cards first (lowest box first), not-due cards after', () => {
    const now = 10 * INTERVALS_MS[4]
    const cards = [card('a'), card('b'), card('c'), card('d')]
    const progress: Record<string, CardProgress> = {
      a: { box: 5, lastReviewedAt: now }, // not due (just reviewed, long interval)
      b: { box: 1, lastReviewedAt: null }, // due, box 1
      c: { box: 3, lastReviewedAt: 0 }, // due (reviewed long ago)
      // d: missing -> initial -> due, box 1
    }
    const order = orderDeck(cards, progress, now).map((c) => c.id)
    // due set = b, c, d; box order 1,1,3 -> b/d before c; a (not due) last
    expect(order[order.length - 1]).toBe('a')
    expect(order.indexOf('c')).toBeGreaterThan(order.indexOf('b'))
    expect(order.indexOf('c')).toBeGreaterThan(order.indexOf('d'))
  })

  it('orders not-due cards by soonest due', () => {
    const now = 0
    const cards = [card('x'), card('y')]
    const progress: Record<string, CardProgress> = {
      x: { box: 5, lastReviewedAt: 0 }, // due far in the future
      y: { box: 3, lastReviewedAt: 0 }, // due sooner
    }
    expect(orderDeck(cards, progress, now).map((c) => c.id)).toEqual(['y', 'x'])
  })

  it('MIN_BOX/MAX_BOX constants are sane', () => {
    expect(MIN_BOX).toBe(1)
    expect(MAX_BOX).toBe(5)
  })
})
