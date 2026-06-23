<script setup lang="ts">
import { computed } from 'vue'
import type { ExamResult } from '@/types/exam'
import { topicLabel } from '@/lib/labels'

const props = defineProps<{ result: ExamResult }>()

const topicRows = computed(() =>
  Object.entries(props.result.byTopic)
    .map(([topic, s]) => ({
      topic,
      label: topicLabel(topic),
      ...s,
      pct: Math.round((s.correct / s.total) * 100),
    }))
    .sort((a, b) => a.pct - b.pct),
)
</script>

<template>
  <div class="stack">
    <div class="card center stack">
      <div class="result__badge" :class="result.passed ? 'is-pass' : 'is-fail'">
        {{ result.passed ? 'PASS' : 'FAIL' }}
      </div>
      <h2 v-if="result.passed">You passed the practice exam! 🎉</h2>
      <h2 v-else>Not passed — keep practicing</h2>
      <p class="muted">
        Part 1 (Signs): {{ result.signPart.correct }}/{{ result.signPart.total }} ·
        Part 2 (Knowledge): {{ result.generalPart.correct }}/{{ result.generalPart.total }}
        ({{ result.generalPart.pct }}%)
      </p>
    </div>

    <div class="card">
      <h3>Part 2 by topic</h3>
      <ul class="topics">
        <li v-for="row in topicRows" :key="row.topic">
          <span>{{ row.label }}</span>
          <span class="pill" :class="row.pct >= 80 ? 'pill--green' : 'pill--red'">
            {{ row.correct }}/{{ row.total }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.result__badge {
  width: 116px;
  height: 116px;
  margin: 4px auto 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 1.5px;
  animation: pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.is-pass {
  background: var(--green);
  box-shadow: 0 0 0 10px var(--green-soft);
}
.is-fail {
  background: var(--red);
  box-shadow: 0 0 0 10px var(--red-soft);
}
.topics {
  list-style: none;
  margin: 0;
  padding: 0;
}
.topics li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
}
.topics li:last-child {
  border-bottom: none;
}
</style>
