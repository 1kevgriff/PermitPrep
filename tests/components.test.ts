import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestionCard from '@/components/question/QuestionCard.vue'
import Part1Gate from '@/components/exam/Part1Gate.vue'
import { makeSign, makeGeneral } from './helpers'

describe('QuestionCard', () => {
  it('renders a sign image for sign questions', () => {
    const wrapper = mount(QuestionCard, {
      props: { question: makeSign('s1'), selectedIndex: null },
    })
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.text()).toContain('What does this sign mean?')
  })

  it('renders no image for general questions', () => {
    const wrapper = mount(QuestionCard, {
      props: { question: makeGeneral('g1', 'speed'), selectedIndex: null },
    })
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('emits select with the chosen index', async () => {
    const wrapper = mount(QuestionCard, {
      props: { question: makeGeneral('g1', 'speed'), selectedIndex: null },
    })
    const choices = wrapper.findAll('.choice')
    await choices[2].trigger('click')
    expect(wrapper.emitted('select')).toEqual([[2]])
  })
})

describe('Part1Gate', () => {
  it('blocks advancing unless all are correct', () => {
    const wrapper = mount(Part1Gate, { props: { correct: 9, total: 10 } })
    expect(wrapper.text()).toContain('must get all')
    // no "Continue to Part 2" button when not passed
    const advance = wrapper.findAll('button').find((b) => b.text().includes('Continue'))
    expect(advance).toBeUndefined()
  })

  it('allows advancing on a perfect Part 1 and emits advance', async () => {
    const wrapper = mount(Part1Gate, { props: { correct: 10, total: 10 } })
    const advance = wrapper.findAll('button').find((b) => b.text().includes('Continue'))
    expect(advance).toBeDefined()
    await advance!.trigger('click')
    expect(wrapper.emitted('advance')).toHaveLength(1)
  })

  it('emits restart from the fail state', async () => {
    const wrapper = mount(Part1Gate, { props: { correct: 8, total: 10 } })
    const restart = wrapper.findAll('button').find((b) => b.text().includes('Restart'))
    await restart!.trigger('click')
    expect(wrapper.emitted('restart')).toHaveLength(1)
  })
})
