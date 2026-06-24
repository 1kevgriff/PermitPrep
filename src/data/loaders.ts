import type { QuestionBank } from '@/types/question'
import type { Manual, Sign } from '@/types/manual'
import type { StateConfig, StateSummary, StatesIndex } from '@/types/state'

/** Base-aware URL for a file shipped in /public/data (works in dev and on Pages). */
function dataUrl(path: string): string {
  return `${import.meta.env.BASE_URL}data/${path}`
}

/** Fetch + cache a JSON file, keyed by its data-relative path. */
const jsonCache = new Map<string, Promise<unknown>>()
function fetchJson<T>(path: string): Promise<T> {
  let cached = jsonCache.get(path)
  if (!cached) {
    cached = fetch(dataUrl(path)).then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
      return res.json()
    })
    jsonCache.set(path, cached)
  }
  return cached as Promise<T>
}

// ---- states -----------------------------------------------------------------

/** The index of available states (`data/states.index.json`). */
export function loadStatesIndex(): Promise<StatesIndex> {
  return fetchJson<StatesIndex>('states.index.json')
}

/** A single state's config, located via its index entry. */
export function loadStateConfig(summary: StateSummary): Promise<StateConfig> {
  return fetchJson<StateConfig>(summary.config)
}

// ---- per-state content ------------------------------------------------------

export function loadQuestionBank(config: StateConfig): Promise<QuestionBank> {
  return fetchJson<QuestionBank>(config.data.questions)
}

export function loadManual(config: StateConfig): Promise<Manual> {
  return fetchJson<Manual>(config.data.manual)
}

export function loadSigns(config: StateConfig): Promise<Sign[]> {
  return fetchJson<Sign[]>(config.data.signs)
}

/** Base-aware URL for an image shipped in /public/images. */
export function assetUrl(relativePath: string): string {
  return `${import.meta.env.BASE_URL}${relativePath}`
}
