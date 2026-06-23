<script setup lang="ts">
import { computed } from 'vue'
import { useContentStore } from '@/stores/content'
import SectionContent from '@/components/manual/SectionContent.vue'

const props = defineProps<{ sectionId: string }>()
const content = useContentStore()

const section = computed(() => content.sectionBySlug.get(props.sectionId) ?? null)
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
  display: inline-block;
  font-weight: 650;
  text-decoration: none;
}
.title {
  font-size: 1.5rem;
  margin-top: 4px;
}
.pager {
  justify-content: space-between;
}
.pager .btn {
  max-width: 48%;
}
</style>
