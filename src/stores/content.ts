import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Question, SignQuestion, GeneralQuestion } from '@/types/question'
import type { Manual, ManualSection, Sign } from '@/types/manual'
import type { FlashCard } from '@/types/flashcard'
import { loadQuestionBank, loadManual, loadSigns } from '@/data/loaders'

/** Loads and indexes the static content (manual, signs, question bank). */
export const useContentStore = defineStore('content', () => {
  const loaded = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const questions = ref<Question[]>([])
  const manual = ref<Manual | null>(null)
  const signs = ref<Sign[]>([])

  async function ensureLoaded(): Promise<void> {
    if (loaded.value || loading.value) return
    loading.value = true
    error.value = null
    try {
      const [bank, man, sg] = await Promise.all([
        loadQuestionBank(),
        loadManual(),
        loadSigns(),
      ])
      questions.value = bank.questions
      manual.value = man
      signs.value = sg
      loaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load content'
    } finally {
      loading.value = false
    }
  }

  const signQuestions = computed(
    () => questions.value.filter((q): q is SignQuestion => q.type === 'sign'),
  )
  const generalQuestions = computed(
    () => questions.value.filter((q): q is GeneralQuestion => q.type === 'general'),
  )

  const questionById = computed(() => {
    const map = new Map<string, Question>()
    for (const q of questions.value) map.set(q.id, q)
    return map
  })

  const questionsByTopic = computed(() => {
    const map = new Map<string, Question[]>()
    for (const q of questions.value) {
      const bucket = map.get(q.topic) ?? []
      bucket.push(q)
      map.set(q.topic, bucket)
    }
    return map
  })

  /** Topic slugs for general questions (excludes the image 'signs' topic). */
  const topics = computed(() =>
    [...new Set(generalQuestions.value.map((q) => q.topic))].sort(),
  )

  const signById = computed(() => {
    const map = new Map<string, Sign>()
    for (const s of signs.value) map.set(s.signId, s)
    return map
  })

  const sections = computed<ManualSection[]>(() => manual.value?.sections ?? [])
  const sectionBySlug = computed(() => {
    const map = new Map<string, ManualSection>()
    for (const s of sections.value) map.set(s.slug, s)
    return map
  })

  /** Flash-card decks derived from content. */
  const signCards = computed<FlashCard[]>(() =>
    signs.value.map((s) => ({
      id: `sign:${s.signId}`,
      deck: 'signs',
      image: s.image,
      front: 'What does this sign mean?',
      back: `${s.name} — ${s.meaning}`,
    })),
  )

  const factCards = computed<FlashCard[]>(() =>
    generalQuestions.value.map((q) => ({
      id: `fact:${q.id}`,
      deck: 'facts',
      front: q.prompt,
      back: `${q.choices[q.answerIndex]} — ${q.explanation}`,
    })),
  )

  return {
    loaded,
    loading,
    error,
    questions,
    manual,
    signs,
    ensureLoaded,
    signQuestions,
    generalQuestions,
    questionById,
    questionsByTopic,
    topics,
    signById,
    sections,
    sectionBySlug,
    signCards,
    factCards,
  }
})
