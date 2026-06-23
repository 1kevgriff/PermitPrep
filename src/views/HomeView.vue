<script setup lang="ts">
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import { useContentStore } from '@/stores/content'
import { topicLabel } from '@/lib/labels'

const progress = useProgressStore()
const content = useContentStore()

const tiles = [
  { to: '/exam', title: 'Take the Exam', desc: 'Full mock test, just like the DMV', icon: '✓', tone: 'green' },
  { to: '/practice', title: 'Practice', desc: 'Pick a topic, instant feedback', icon: '✎', tone: 'blue' },
  { to: '/flashcards', title: 'Flash Cards', desc: 'Signs & facts, swipe to learn', icon: '⚏', tone: 'blue' },
  { to: '/manual', title: 'Driver\'s Manual', desc: 'Read & search all 8 sections', icon: '☰', tone: 'blue' },
]

const hasHistory = computed(() => progress.attemptsCount > 0)
const weak = computed(() => progress.weakestTopics.slice(0, 3))
const signTotal = computed(() => content.signQuestions.length)
const generalTotal = computed(() => content.generalQuestions.length)
</script>

<template>
  <div class="stack">
    <section class="hero card">
      <h1>Pass your Virginia permit test</h1>
      <p class="muted">
        {{ signTotal }} traffic signs and {{ generalTotal }} knowledge questions, straight from
        the official manual. Free, works offline.
      </p>
      <RouterLink to="/exam" class="btn btn--green btn--lg">Start a mock exam →</RouterLink>
    </section>

    <section v-if="hasHistory" class="grid grid--2">
      <div class="card stat">
        <span class="stat__num">{{ progress.bestGeneralPct }}%</span>
        <span class="muted">Best knowledge score</span>
      </div>
      <div class="card stat">
        <span class="stat__num">{{ progress.passRate }}%</span>
        <span class="muted">Pass rate ({{ progress.attemptsCount }} tries)</span>
      </div>
    </section>

    <section v-if="weak.length" class="card">
      <h3>Focus on these topics</h3>
      <ul class="weak">
        <li v-for="t in weak" :key="t.topic">
          <span>{{ topicLabel(t.topic) }}</span>
          <span class="pill pill--red">{{ t.pct }}%</span>
        </li>
      </ul>
      <RouterLink to="/practice" class="btn btn--ghost btn--block">Practice weak topics</RouterLink>
    </section>

    <section v-if="progress.missedCount > 0" class="card row" style="justify-content: space-between">
      <div>
        <strong>{{ progress.missedCount }}</strong> question{{ progress.missedCount === 1 ? '' : 's' }}
        to review
      </div>
      <RouterLink to="/review" class="btn">Review missed</RouterLink>
    </section>

    <section class="grid grid--2">
      <RouterLink v-for="tile in tiles" :key="tile.to" :to="tile.to" class="card tile">
        <span class="tile__icon" :class="`tile__icon--${tile.tone}`">{{ tile.icon }}</span>
        <span class="tile__title">{{ tile.title }}</span>
        <span class="muted tile__desc">{{ tile.desc }}</span>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.hero h1 {
  font-size: 1.6rem;
}
.hero .btn {
  margin-top: 8px;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat__num {
  font-size: 2rem;
  font-weight: 900;
  color: var(--blue);
}
.weak {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
}
.weak li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
}
.tile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-decoration: none;
  color: var(--ink);
}
.tile__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-size: 1.4rem;
  margin-bottom: 6px;
  background: var(--blue-soft);
  color: var(--blue);
}
.tile__icon--green {
  background: var(--green-soft);
  color: var(--green);
}
.tile__title {
  font-weight: 750;
  font-size: 1.05rem;
}
.tile__desc {
  font-size: 0.9rem;
}
</style>
