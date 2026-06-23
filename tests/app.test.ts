import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { readFileSync } from 'node:fs'
import App from '@/App.vue'
import { router } from '@/router'
import { persistPlugin } from '@/stores/persist'
import { useSessionStore } from '@/stores/session'
import { useProgressStore } from '@/stores/progress'

const root = process.cwd() + '/'
const fixture = (f: string) => readFileSync(root + 'public/data/' + f, 'utf8')

let current: VueWrapper | null = null

async function mountAppAt(path: string) {
  const pinia = createPinia()
  pinia.use(persistPlugin)
  setActivePinia(pinia)
  current = mount(App, { global: { plugins: [router, pinia] } })
  await router.isReady()
  await router.push(path)
  await flushPromises()
  return current
}

beforeEach(() => {
  localStorage.clear()
  // happy-dom doesn't implement confirm; route-leave guards call it.
  vi.stubGlobal('confirm', () => true)
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => ({
      ok: true,
      json: async () => JSON.parse(fixture(url.split('/data/')[1])),
    })) as unknown as typeof fetch,
  )
})

afterEach(async () => {
  // Unmount so this App's route-leave guards don't fire during later tests.
  await router.push('/')
  current?.unmount()
  current = null
})

describe('App (full render through the router)', () => {
  it('renders the home dashboard', async () => {
    const wrapper = await mountAppAt('/')
    expect(wrapper.text()).toContain('Pass your Virginia permit test')
    expect(wrapper.text()).toContain('Take the Exam')
  })

  it('starts an exam and shows a Part 1 sign question', async () => {
    const wrapper = await mountAppAt('/exam')
    expect(wrapper.text()).toContain('Part 1')
    expect(wrapper.text()).toContain('What does this sign mean?')
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.findAll('.choice').length).toBe(4)
  })

  it('navigates to the manual and lists all 8 sections', async () => {
    const wrapper = await mountAppAt('/manual')
    expect(wrapper.text()).toContain("Driver's Manual")
    expect(wrapper.findAll('.sect').length).toBe(8)
  })

  /** Click the correct choice (known from the session store) then the nav button. */
  async function answerPart(wrapper: VueWrapper, count: number, finalLabel: string) {
    const session = useSessionStore()
    for (let i = 0; i < count; i++) {
      const qs = session.exam!.phase === 'part1' ? session.exam!.sign : session.exam!.general
      const correct = qs[i].answerIndex
      await wrapper.findAll('.choice')[correct].trigger('click')
      const label = i < count - 1 ? 'Next' : finalLabel
      const btn = wrapper.findAll('button').find((b) => b.text().trim() === label)
      await btn!.trigger('click')
      await flushPromises()
    }
  }

  it('completes a full passing exam end to end (Part 1 gate → Part 2 → PASS)', async () => {
    const wrapper = await mountAppAt('/exam')
    await answerPart(wrapper, 10, 'Submit Part 1')
    expect(wrapper.text()).toContain('Part 1 passed')

    const cont = wrapper.findAll('button').find((b) => b.text().includes('Continue to Part 2'))
    await cont!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Part 2')

    await answerPart(wrapper, 25, 'Finish exam')

    // Deterministic proof the full Part 1 → gate → Part 2 click-through graded a
    // pass and transitioned to the result (set synchronously in finishExam()).
    const progress = useProgressStore()
    const session = useSessionStore()
    expect(progress.lastResult?.passed).toBe(true)
    expect(progress.missedCount).toBe(0)
    expect(session.exam?.phase).toBe('result')
    expect(session.exam?.resultId).toBeTruthy()
  })

  it('restores an in-progress exam after a reload', async () => {
    const wrapper1 = await mountAppAt('/exam')
    const firstId = useSessionStore().exam!.sign[0].id
    await wrapper1.findAll('.choice')[1].trigger('click') // answer Q1
    await flushPromises()
    wrapper1.unmount() // simulate closing the tab; localStorage keeps the session

    // Remount with a fresh pinia — should resume the same exam from storage.
    const wrapper2 = await mountAppAt('/exam')
    const restored = useSessionStore().exam
    expect(restored?.sign[0].id).toBe(firstId)
    expect(restored?.answers[firstId]).toBe(1)
    expect(wrapper2.text()).toContain('What does this sign mean?')
  })
})
