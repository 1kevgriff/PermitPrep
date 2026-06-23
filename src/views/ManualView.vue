<script setup lang="ts">
import { ref } from 'vue'
import { useContentStore } from '@/stores/content'
import { useManualSearch } from '@/composables/useManualSearch'

const content = useContentStore()
const query = ref('')
const { results } = useManualSearch(query)
</script>

<template>
  <div class="stack">
    <div class="card stack">
      <h1>Driver's Manual</h1>
      <input
        v-model="query"
        class="search"
        type="search"
        placeholder="Search the manual (e.g. roundabout, BAC, school bus)…"
        aria-label="Search the manual"
      />
    </div>

    <div v-if="query.trim().length >= 2" class="stack">
      <p class="muted">{{ results.length }} section(s) match “{{ query }}”.</p>
      <RouterLink
        v-for="hit in results"
        :key="hit.section.slug"
        :to="`/manual/${hit.section.slug}`"
        class="card hit"
      >
        <div class="row" style="justify-content: space-between">
          <strong>{{ hit.section.number }}. {{ hit.section.title }}</strong>
          <span class="pill">{{ hit.matches }}</span>
        </div>
        <p class="muted hit__snip">{{ hit.snippet }}</p>
      </RouterLink>
    </div>

    <ol v-else class="sections">
      <li v-for="section in content.sections" :key="section.slug">
        <RouterLink :to="`/manual/${section.slug}`" class="card sect">
          <span class="sect__num">{{ section.number }}</span>
          <span class="sect__title">{{ section.title }}</span>
          <span class="sect__chev">›</span>
        </RouterLink>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.search {
  width: 100%;
  min-height: var(--tap);
  padding: 0 14px;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font-size: 1rem;
}
.sections {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}
.sect {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--ink);
}
.sect__num {
  display: grid;
  place-items: center;
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--blue);
  color: #fff;
  font-weight: 800;
}
.sect__title {
  flex: 1;
  font-weight: 650;
}
.sect__chev {
  color: var(--muted);
  font-size: 1.4rem;
}
.hit {
  display: block;
  text-decoration: none;
  color: var(--ink);
}
.hit__snip {
  margin: 6px 0 0;
  font-size: 0.92rem;
}
</style>
