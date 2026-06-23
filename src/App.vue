<script setup lang="ts">
import { onMounted } from 'vue'
import { useContentStore } from '@/stores/content'
import NavBar from '@/components/common/NavBar.vue'

const content = useContentStore()
onMounted(() => content.ensureLoaded())
</script>

<template>
  <a class="skip" href="#main">Skip to content</a>
  <header class="appbar">
    <div class="appbar__inner container">
      <RouterLink to="/" class="brand">
        <span class="brand__mark" aria-hidden="true">VA</span>
        <span class="brand__name">Permit Prep</span>
      </RouterLink>
      <span class="pill pill--amber">Virginia DMV</span>
    </div>
    <div class="appbar__road" aria-hidden="true"></div>
  </header>

  <main id="main" class="container">
    <div v-if="content.error" class="card center">
      <h2>Couldn't load study content</h2>
      <p class="muted">{{ content.error }}</p>
      <button class="btn" @click="content.ensureLoaded()">Try again</button>
    </div>
    <div v-else-if="!content.loaded" class="card center muted">Loading study content…</div>
    <RouterView v-else />
  </main>

  <NavBar />
</template>

<style scoped>
.appbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--ink-2);
  color: #fff;
  box-shadow: 0 4px 18px rgba(15, 27, 45, 0.25);
}
.appbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  padding-bottom: 12px;
}
/* dashed road centre-line under the bar — the signature motif */
.appbar__road {
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    var(--amber) 0 18px,
    transparent 18px 34px
  );
  opacity: 0.85;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.18rem;
  text-decoration: none;
  letter-spacing: 0.2px;
}
.brand__name {
  line-height: 1;
}
.brand__mark {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--amber);
  color: var(--ink-2);
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.5px;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.25);
}
main {
  padding-top: 6px;
  padding-bottom: 104px;
  animation: rise 0.3s ease both;
}
</style>
