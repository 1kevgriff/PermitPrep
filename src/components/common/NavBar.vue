<script setup lang="ts">
const links = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/exam', label: 'Exam', icon: 'exam' },
  { to: '/practice', label: 'Practice', icon: 'practice' },
  { to: '/flashcards', label: 'Cards', icon: 'cards' },
  { to: '/manual', label: 'Manual', icon: 'manual' },
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
      <span class="tab__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <template v-if="link.icon === 'home'">
            <path d="M3 10.5 12 4l9 6.5" />
            <path d="M5 9.5V20h14V9.5" />
          </template>
          <template v-else-if="link.icon === 'exam'">
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M9 8h6M9 12h6M9 16h3" />
          </template>
          <template v-else-if="link.icon === 'practice'">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </template>
          <template v-else-if="link.icon === 'cards'">
            <rect x="3" y="6" width="14" height="12" rx="2" />
            <path d="M8 4h11a2 2 0 0 1 2 2v9" />
          </template>
          <template v-else>
            <path d="M4 5h16M4 12h16M4 19h10" />
          </template>
        </svg>
      </span>
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
  z-index: 20;
  display: flex;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(1.4) blur(10px);
  border-top: 1px solid var(--line);
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -4px 22px rgba(16, 32, 56, 0.08);
}
.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 9px 4px 8px;
  min-height: var(--tap);
  color: var(--muted);
  text-decoration: none;
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.tab__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 30px;
  border-radius: 999px;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}
.tab.router-link-active {
  color: var(--green-dark);
}
.tab.router-link-active .tab__icon {
  background: var(--green-soft);
  color: var(--green-dark);
  transform: translateY(-1px);
}
/* Home is active on '/' only (exact); others use prefix matching. */
.tab--home.router-link-active:not(.router-link-exact-active) {
  color: var(--muted);
}
.tab--home.router-link-active:not(.router-link-exact-active) .tab__icon {
  background: transparent;
  color: var(--muted);
  transform: none;
}
</style>
