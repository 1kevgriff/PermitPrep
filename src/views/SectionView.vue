<script setup lang="ts">
import { computed } from 'vue'
import { useContentStore } from '@/stores/content'
import SectionContent from '@/components/manual/SectionContent.vue'

const props = defineProps<{ sectionId: string }>()
const content = useContentStore()

const section = computed(() => content.sectionBySlug.get(props.sectionId) ?? null)
// The manual's "sample exam" is replaced by a pointer to the real interactive exam.
const isSampleExam = computed(() => props.sectionId === 'sample-knowledge-exam')
const sections = computed(() => content.sections)
const currentIndex = computed(() =>
  sections.value.findIndex((s) => s.slug === props.sectionId),
)
const prev = computed(() => sections.value[currentIndex.value - 1] ?? null)
const next = computed(() => sections.value[currentIndex.value + 1] ?? null)
</script>

<template>
  <div v-if="section" class="stack">
    <RouterLink to="/manual" class="back">← All sections</RouterLink>
    <div class="card">
      <span class="pill">Section {{ section.number }}</span>
      <h1 class="title">{{ section.title }}</h1>
      <SectionContent :section="section" />
      <RouterLink v-if="isSampleExam" to="/exam" class="btn btn--green btn--block exam-cta">
        Start the practice exam →
      </RouterLink>
    </div>

    <div class="row pager">
      <RouterLink v-if="prev" :to="`/manual/${prev.slug}`" class="btn btn--ghost">
        ← {{ prev.title }}
      </RouterLink>
      <span v-else />
      <RouterLink v-if="next" :to="`/manual/${next.slug}`" class="btn btn--ghost">
        {{ next.title }} →
      </RouterLink>
    </div>
  </div>

  <div v-else class="card center stack">
    <h2>Section not found</h2>
    <RouterLink to="/manual" class="btn">Back to manual</RouterLink>
  </div>
</template>

<style scoped>
.back {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-display);
  font-weight: 700;
  text-decoration: none;
  color: var(--sky-dark);
}
.title {
  font-size: 1.6rem;
  margin-top: 8px;
}
.exam-cta {
  margin-top: 18px;
}
.pager {
  justify-content: space-between;
  gap: 10px;
  align-items: stretch;
}
.pager .btn {
  flex: 1;
  min-width: 0;
  font-size: 0.85rem;
  line-height: 1.2;
  padding: 12px;
  text-align: center;
  white-space: normal;
  word-break: break-word;
}
</style>
