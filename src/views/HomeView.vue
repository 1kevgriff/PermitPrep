<script setup lang="ts">
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import { useContentStore } from '@/stores/content'
import { topicLabel } from '@/lib/labels'

const progress = useProgressStore()
const content = useContentStore()

const tiles = [
  { to: '/exam', title: 'Take the Exam', desc: 'Full mock test, like the DMV', icon: 'exam', tone: 'green' },
  { to: '/practice', title: 'Practice', desc: 'Pick a topic, instant feedback', icon: 'practice', tone: 'sky' },
  { to: '/flashcards', title: 'Flash Cards', desc: 'Signs & facts, tap to flip', icon: 'cards', tone: 'amber' },
  { to: '/manual', title: "Driver's Manual", desc: 'Read & search all 8 sections', icon: 'manual', tone: 'sky' },
]

const hasHistory = computed(() => progress.attemptsCount > 0)
const weak = computed(() => progress.weakestTopics.slice(0, 3))
const signTotal = computed(() => content.signQuestions.length)
const generalTotal = computed(() => content.generalQuestions.length)
</script>

<template>
  <div class="stack home">
    <section class="hero">
      <div class="hero__lane" aria-hidden="true"></div>
      <div class="hero__body">
        <span class="hero__eyebrow">Virginia learner's permit</span>
        <h1>Pass your Virginia permit test</h1>
        <p class="hero__sub">
          {{ signTotal }} traffic signs and {{ generalTotal }} knowledge questions, straight from the
          official manual. Free, and it works offline.
        </p>
        <RouterLink to="/exam" class="btn btn--green btn--lg hero__cta">
          Start a mock exam
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </RouterLink>
      </div>
    </section>

    <section v-if="hasHistory" class="grid grid--2">
      <div class="card stat">
        <span class="stat__num">{{ progress.bestGeneralPct }}%</span>
        <span class="muted stat__label">Best knowledge score</span>
      </div>
      <div class="card stat">
        <span class="stat__num">{{ progress.passRate }}%</span>
        <span class="muted stat__label">Pass rate · {{ progress.attemptsCount }} tries</span>
      </div>
    </section>

    <section v-if="weak.length" class="card">
      <h3 class="home__h">Focus on these topics</h3>
      <ul class="weak">
        <li v-for="t in weak" :key="t.topic">
          <span>{{ topicLabel(t.topic) }}</span>
          <span class="pill pill--red">{{ t.pct }}%</span>
        </li>
      </ul>
      <RouterLink to="/practice" class="btn btn--ghost btn--block">Practice weak topics</RouterLink>
    </section>

    <section v-if="progress.missedCount > 0" class="card review-strip">
      <div class="review-strip__text">
        <strong>{{ progress.missedCount }}</strong> question{{ progress.missedCount === 1 ? '' : 's' }}
        to review
      </div>
      <RouterLink to="/review" class="btn">Review missed</RouterLink>
    </section>

    <section class="grid grid--2 tiles">
      <RouterLink v-for="tile in tiles" :key="tile.to" :to="tile.to" class="card tile">
        <span class="tile__icon" :class="`tile__icon--${tile.tone}`" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <template v-if="tile.icon === 'exam'">
              <rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" />
            </template>
            <template v-else-if="tile.icon === 'practice'">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </template>
            <template v-else-if="tile.icon === 'cards'">
              <rect x="3" y="6" width="14" height="12" rx="2" /><path d="M8 4h11a2 2 0 0 1 2 2v9" />
            </template>
            <template v-else>
              <path d="M4 5h16M4 12h16M4 19h10" />
            </template>
          </svg>
        </span>
        <span class="tile__title">{{ tile.title }}</span>
        <span class="muted tile__desc">{{ tile.desc }}</span>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
/* ---- Hero: the road-ahead thesis ---- */
.hero {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius);
  background:
    radial-gradient(120% 90% at 50% -10%, #1c3454 0%, var(--ink-2) 65%);
  color: #fff;
  box-shadow: var(--shadow);
  isolation: isolate;
}
/* converging dashed lane lines rising up the left edge */
.hero__lane {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: -1;
  background:
    repeating-linear-gradient(180deg, rgba(245, 163, 26, 0.9) 0 22px, transparent 22px 46px);
  width: 6px;
  left: 14px;
  opacity: 0.5;
  mask-image: linear-gradient(180deg, transparent, #000 30%, #000 80%, transparent);
}
.hero__body {
  padding: 26px 22px 24px 30px;
}
.hero__eyebrow {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--amber);
  margin-bottom: 8px;
}
.hero h1 {
  font-size: 1.72rem;
  font-weight: 900;
  margin-bottom: 10px;
  text-wrap: balance;
}
.hero__sub {
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.98rem;
  margin: 0 0 18px;
}
.hero__cta {
  width: 100%;
}

/* ---- Stats ---- */
.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 18px;
}
.stat__num {
  font-family: var(--font-display);
  font-size: 2.1rem;
  font-weight: 900;
  color: var(--green-dark);
  line-height: 1;
}
.stat__label {
  font-size: 0.85rem;
}

.home__h {
  font-size: 1.12rem;
  margin-bottom: 12px;
}
.weak {
  list-style: none;
  margin: 0 0 14px;
  padding: 0;
}
.weak li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}
.weak li:last-child {
  border-bottom: none;
}

.review-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: var(--amber-soft);
  border-color: #f3dca6;
}
.review-strip__text {
  font-size: 0.96rem;
}
.review-strip strong {
  font-family: var(--font-display);
  font-size: 1.15rem;
  color: #9a6708;
}

/* ---- Feature tiles ---- */
.tiles {
  margin-top: 2px;
}
.tile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-decoration: none;
  color: var(--ink);
  padding: 16px;
  transition:
    transform 0.12s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}
.tile:active {
  transform: translateY(2px) scale(0.99);
}
.tile:hover {
  border-color: #cfd9e6;
  box-shadow: 0 8px 22px rgba(16, 32, 56, 0.1);
}
.tile__icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  margin-bottom: 8px;
  background: var(--sky-soft);
  color: var(--sky-dark);
}
.tile__icon--green {
  background: var(--green-soft);
  color: var(--green-dark);
}
.tile__icon--amber {
  background: var(--amber-soft);
  color: #9a6708;
}
.tile__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.02rem;
  line-height: 1.2;
}
.tile__desc {
  font-size: 0.85rem;
  line-height: 1.35;
}

@media (min-width: 560px) {
  .hero h1 {
    font-size: 2.2rem;
  }
  .hero__cta {
    width: auto;
  }
}
</style>
