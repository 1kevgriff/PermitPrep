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
    <strong>{{ correct ? 'Correct!' : 'Not quite.' }}</strong>
    <p>{{ explanation }}</p>
    <RouterLink v-if="section" :to="`/manual/${section.slug}`" class="explain__link">
      Read more in {{ section.title }} →
    </RouterLink>
  </div>
</template>

<style scoped>
.explain {
  margin-top: 14px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--bg);
}
.explain--ok {
  border-color: var(--green);
  background: var(--green-soft);
}
.explain--no {
  border-color: var(--amber);
  background: #fdf4e1;
}
.explain p {
  margin: 6px 0 8px;
}
.explain__link {
  font-weight: 650;
}
</style>
