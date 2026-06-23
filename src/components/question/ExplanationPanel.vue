<script setup lang="ts">
import { computed } from 'vue'
import { useContentStore } from '@/stores/content'

const props = defineProps<{
  correct: boolean
  explanation: string
  sectionSlug: string
}>()

const content = useContentStore()
const section = computed(() => content.sectionBySlug.get(props.sectionSlug))
</script>

<template>
  <div class="explain" :class="correct ? 'explain--ok' : 'explain--no'">
    <div class="explain__head">
      <span class="explain__icon" aria-hidden="true">
        <svg v-if="correct" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7" /></svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5M12 16.5h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
      </span>
      <strong>{{ correct ? 'Correct!' : 'Not quite' }}</strong>
    </div>
    <p>{{ explanation }}</p>
    <RouterLink v-if="section" :to="`/manual/${section.slug}`" class="explain__link">
      Read more in {{ section.title }}
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </RouterLink>
  </div>
</template>

<style scoped>
.explain {
  margin-top: 16px;
  padding: 16px;
  border-radius: 14px;
  border: 1.5px solid var(--line);
  background: var(--bg);
  animation: rise 0.28s ease both;
}
.explain--ok {
  border-color: var(--green);
  background: var(--green-soft);
}
.explain--no {
  border-color: var(--amber);
  background: var(--amber-soft);
}
.explain__head {
  display: flex;
  align-items: center;
  gap: 9px;
  font-family: var(--font-display);
  font-size: 1.05rem;
}
.explain__icon {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  color: #fff;
  animation: pop-in 0.34s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.explain--ok .explain__icon {
  background: var(--green);
}
.explain--no .explain__icon {
  background: var(--amber);
}
.explain p {
  margin: 9px 0 10px;
}
.explain__link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.92rem;
  text-decoration: none;
}
</style>
