<script setup lang="ts">
const links = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/exam', label: 'Exam', icon: '✓' },
  { to: '/practice', label: 'Practice', icon: '✎' },
  { to: '/flashcards', label: 'Cards', icon: '⚏' },
  { to: '/manual', label: 'Manual', icon: '☰' },
]
</script>

<template>
  <nav class="tabbar" aria-label="Primary">
    <RouterLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="tab"
      :class="{ 'tab--home': link.to === '/' }"
    >
      <span class="tab__icon" aria-hidden="true">{{ link.icon }}</span>
      <span class="tab__label">{{ link.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  background: #fff;
  border-top: 1px solid var(--line);
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2px 14px rgba(16, 36, 64, 0.06);
}
.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  min-height: var(--tap);
  color: var(--muted);
  text-decoration: none;
  font-size: 0.72rem;
  font-weight: 600;
}
.tab__icon {
  font-size: 1.25rem;
  line-height: 1;
}
.tab.router-link-active {
  color: var(--blue);
}
/* Home is active on '/' only (exact); others use prefix matching. */
.tab--home.router-link-active:not(.router-link-exact-active) {
  color: var(--muted);
}
</style>
