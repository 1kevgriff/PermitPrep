import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DebugView from '@/views/DebugView.vue'
import { useContentStore } from '@/stores/content'
import { makeBank } from './helpers'

function mountDebug() {
  const content = useContentStore()
  content.questions = makeBank(3, ['speed', 'signals'], 2) // 3 signs + 4 general = 7
  return mount(DebugView, {
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('DebugView', () => {
  it('starts at question 1 of the full bank', () => {
    const w = mountDebug()
    expect(w.text()).toContain('/ 7')
    expect((w.find('.dbg-jump').element as HTMLInputElement).value).toBe('1')
  })

  it('does not reveal the answer until asked', async () => {
    const w = mountDebug()
    expect(w.find('.explain').exists()).toBe(false)
    await w.findAll('button').find((b) => b.text().includes('Reveal'))!.trigger('click')
    // Reused ExplanationPanel in its neutral "Answer" mode.
    expect(w.find('.explain').exists()).toBe(true)
    expect(w.find('.explain').text()).toContain('Answer')
  })

  it('selecting a choice reveals correctness', async () => {
    const w = mountDebug()
    await w.findAll('.choice')[1].trigger('click') // bank answers default to index 0
    const answer = w.find('.explain')
    expect(answer.exists()).toBe(true)
    expect(answer.text()).toContain('Not quite') // ExplanationPanel's wrong-answer header
  })

  it('Next advances and remembers a prior reveal when navigating back', async () => {
    const w = mountDebug()
    await w.findAll('button').find((b) => b.text().includes('Reveal'))!.trigger('click')
    await w.findAll('button').find((b) => b.text().includes('Next'))!.trigger('click')
    expect((w.find('.dbg-jump').element as HTMLInputElement).value).toBe('2')
    expect(w.find('.explain').exists()).toBe(false) // fresh question, not revealed
    await w.findAll('button').find((b) => b.text().includes('Prev'))!.trigger('click')
    expect(w.find('.explain').exists()).toBe(true) // remembered
  })

  it('filtering to signs narrows the list and resets to the first', async () => {
    const w = mountDebug()
    await w.findAll('button').find((b) => b.text().includes('Signs'))!.trigger('click')
    expect(w.text()).toContain('/ 3')
    expect(w.find('img').exists()).toBe(true) // sign questions render an image
  })
})
