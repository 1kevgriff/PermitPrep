import { describe, it, expect } from 'vitest'
import { mulberry32, rngFromSeed, shuffle, hashSeed } from '@/lib/shuffle'

describe('shuffle', () => {
  it('is deterministic for a given seed', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8]
    const a = shuffle(items, mulberry32(42))
    const b = shuffle(items, mulberry32(42))
    expect(a).toEqual(b)
  })

  it('produces different orders for different seeds', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const a = shuffle(items, rngFromSeed('one'))
    const b = shuffle(items, rngFromSeed('two'))
    expect(a).not.toEqual(b)
  })

  it('does not mutate the input and preserves all elements', () => {
    const items = [1, 2, 3, 4, 5]
    const copy = items.slice()
    const out = shuffle(items, mulberry32(7))
    expect(items).toEqual(copy)
    expect(out.slice().sort((x, y) => x - y)).toEqual(copy)
  })

  it('hashSeed is stable', () => {
    expect(hashSeed('exam')).toBe(hashSeed('exam'))
    expect(hashSeed('exam')).not.toBe(hashSeed('practice'))
  })
})
