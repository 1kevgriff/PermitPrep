import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { readFileSync } from 'node:fs'
import App from '@/App.vue'
import { router } from '@/router'
import { persistPlugin } from '@/stores/persist'

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
})
