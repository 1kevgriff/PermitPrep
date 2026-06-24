<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStatesStore } from '@/stores/states'
import { useContentStore } from '@/stores/content'
import { useSessionStore } from '@/stores/session'

const states = useStatesStore()
const content = useContentStore()
const session = useSessionStore()
const router = useRouter()

const switching = ref(false)

async function choose(id: string): Promise<void> {
  if (switching.value) return
  if (id === states.activeId) {
    router.push('/')
    return
  }
  switching.value = true
  // Switching states invalidates the active run and reloads that state's bank.
  const changed = await states.setActive(id)
  if (changed) {
    session.clearExam()
    session.clearPractice()
    await content.reload()
  }
  switching.value = false
  router.push('/')
}
</script>

<template>
  <div class="stack">
    <section class="card">
      <h1 class="picker__title">Choose your state</h1>
      <p class="muted picker__sub">
        Practice tests, signs, and the driver's manual are tailored to each state.
      </p>

      <ul class="picker">
        <li v-for="s in states.index" :key="s.id">
          <button
            class="state-row"
            :class="{ 'state-row--active': s.id === states.activeId }"
            :disabled="switching"
            @click="choose(s.id)"
          >
            <span class="state-row__abbr" aria-hidden="true">{{ s.abbr }}</span>
            <span class="state-row__name">{{ s.name }}</span>
            <span v-if="s.id === states.activeId" class="pill pill--green">Current</span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.picker__title {
  font-size: 1.3rem;
  margin-bottom: 4px;
}
.picker__sub {
  margin-bottom: 16px;
}
.picker {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.state-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  min-height: var(--tap);
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}
.state-row:hover:not(:disabled) {
  border-color: #cfd9e6;
  box-shadow: 0 6px 16px rgba(16, 32, 56, 0.08);
}
.state-row:disabled {
  opacity: 0.6;
  cursor: progress;
}
.state-row--active {
  border-color: var(--green);
  background: var(--green-soft);
}
.state-row__abbr {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--ink-2);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}
.state-row__name {
  flex: 1;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.05rem;
}
</style>
