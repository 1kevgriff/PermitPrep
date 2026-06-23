import type { PiniaPluginContext } from 'pinia'
import { safeStorage } from './safeStorage'

export interface PersistOptions {
  key: string
  /** Runs after persisted state is applied — use to validate/reset. */
  afterHydrate?: (ctx: { store: PiniaPluginContext['store'] }) => void
}

// Allow `persist` in defineStore options.
declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: PersistOptions
  }
}

/**
 * Minimal localStorage persistence for Pinia setup stores. Hydrates on init,
 * then writes the store's `$state` synchronously on every change. Uses
 * `safeStorage`, so storage failures degrade to in-memory state.
 */
export function persistPlugin(context: PiniaPluginContext): void {
  const options = context.options.persist
  if (!options) return
  const { key, afterHydrate } = options

  const raw = safeStorage.getItem(key)
  if (raw) {
    try {
      context.store.$patch(JSON.parse(raw))
    } catch {
      /* corrupt JSON — leave defaults, afterHydrate can reset */
    }
  }
  afterHydrate?.({ store: context.store })

  context.store.$subscribe(
    (_mutation, state) => {
      safeStorage.setItem(key, JSON.stringify(state))
    },
    { detached: true, flush: 'sync' },
  )
}
