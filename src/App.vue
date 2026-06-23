<script setup lang="ts">
import { onMounted } from 'vue'
import { useContentStore } from '@/stores/content'
import NavBar from '@/components/common/NavBar.vue'

const content = useContentStore()
onMounted(() => content.ensureLoaded())
</script>

<template>
  <a class="visually-hidden" href="#main">Skip to content</a>
  <header class="appbar">
    <div class="appbar__inner container">
      <RouterLink to="/" class="brand">
        <span class="brand__mark">VA</span>
        <span>Permit Prep</span>
      </RouterLink>
      <span class="pill">Virginia</span>
    </div>
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
  z-index: 10;
  background: var(--blue);
  color: #fff;
  box-shadow: 0 2px 10px rgba(8, 64, 111, 0.25);
}
.appbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  padding-bottom: 10px;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-weight: 800;
  font-size: 1.15rem;
  text-decoration: none;
  letter-spacing: 0.2px;
}
.brand__mark {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #fff;
  color: var(--blue);
  font-size: 0.85rem;
  font-weight: 900;
}
main {
  padding-bottom: 96px;
}
</style>
