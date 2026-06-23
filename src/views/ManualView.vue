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
  border: 2px solid var(--line);
  border-radius: 14px;
  font-family: var(--font-body);
  font-size: 1rem;
  background: var(--bg);
  transition:
    border-color 0.14s ease,
    background 0.14s ease;
}
.search:focus {
  outline: none;
  border-color: var(--sky);
  background: #fff;
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
  gap: 14px;
  text-decoration: none;
  color: var(--ink);
  padding: 14px 16px;
  transition:
    transform 0.1s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}
.sect:active {
  transform: translateX(2px);
}
.sect:hover {
  border-color: #cfd9e6;
  box-shadow: 0 6px 18px rgba(16, 32, 56, 0.08);
}
/* route-shield styled section number */
.sect__num {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: var(--ink-2);
  color: var(--amber);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.05rem;
  box-shadow: inset 0 0 0 2px rgba(245, 163, 26, 0.3);
}
.sect__title {
  flex: 1;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.25;
}
.sect__chev {
  color: var(--sky);
  font-size: 1.5rem;
  font-weight: 700;
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
