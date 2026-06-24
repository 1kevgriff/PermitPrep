import { createRouter, createWebHashHistory } from 'vue-router'
import { useContentStore } from '@/stores/content'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/states', name: 'states', component: () => import('@/views/StatePickerView.vue') },
    { path: '/manual', name: 'manual', component: () => import('@/views/ManualView.vue') },
    {
      path: '/manual/:sectionId',
      name: 'section',
      component: () => import('@/views/SectionView.vue'),
      props: true,
    },
    { path: '/exam', name: 'exam', component: () => import('@/views/ExamView.vue') },
    {
      path: '/exam/result/:id',
      name: 'exam-result',
      component: () => import('@/views/ExamResultView.vue'),
      props: true,
    },
    { path: '/practice', name: 'practice', component: () => import('@/views/PracticeSetupView.vue') },
    { path: '/practice/run', name: 'practice-run', component: () => import('@/views/PracticeView.vue') },
    { path: '/flashcards', name: 'flashcards', component: () => import('@/views/FlashcardsView.vue') },
    { path: '/review', name: 'review', component: () => import('@/views/ReviewMissedView.vue') },
    // Hidden QA tool — browse every question in the bank. Not linked in the nav.
    { path: '/debug', name: 'debug', component: () => import('@/views/DebugView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
})

// Ensure static content is loaded before any view renders.
router.beforeEach(async () => {
  const content = useContentStore()
  if (!content.loaded) await content.ensureLoaded()
  return true
})

export { router }
