import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { StateConfig, StateSummary } from '@/types/state'
import { loadStateConfig, loadStatesIndex } from '@/data/loaders'
import { safeStorage } from './safeStorage'

const ACTIVE_KEY = 'permitprep:v1:activeState'

/**
 * Tracks the available states and which one is active. The active id is
 * persisted on its own (not via the whole-state persist plugin) so a reload
 * always re-reads the index and config fresh.
 */
export const useStatesStore = defineStore('states', () => {
  const index = ref<StateSummary[]>([])
  const activeId = ref<string>(safeStorage.getItem(ACTIVE_KEY) ?? '')
  const config = ref<StateConfig | null>(null)
  const ready = ref(false)

  const active = computed<StateSummary | null>(
    () => index.value.find((s) => s.id === activeId.value) ?? null,
  )

  function persistActive(id: string): void {
    activeId.value = id
    safeStorage.setItem(ACTIVE_KEY, id)
  }

  /** Load the index and the active state's config (once). */
  async function ensureReady(): Promise<void> {
    if (ready.value) return
    const idx = await loadStatesIndex()
    index.value = idx.states
    // Fall back to the default if nothing is chosen or the saved id is gone.
    if (!active.value) persistActive(idx.default)
    config.value = await loadStateConfig(active.value!)
    ready.value = true
  }

  /**
   * Switch the active state and load its config. Returns true if the active
   * state actually changed (callers reload content + clear the session).
   */
  async function setActive(id: string): Promise<boolean> {
    if (id === activeId.value || !index.value.some((s) => s.id === id)) return false
    persistActive(id)
    config.value = await loadStateConfig(active.value!)
    return true
  }

  return { index, activeId, config, ready, active, ensureReady, setActive }
})
