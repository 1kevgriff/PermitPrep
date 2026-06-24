import type { ExamConfig } from './exam'

/**
 * Multi-state configuration. Adding a state is "drop a `public/data/{id}/`
 * folder + a `states.index.json` entry" — no code changes. Everything the UI
 * shows for a state is data-driven through {@link StateConfig}.
 */

/** One entry in `public/data/states.index.json`. */
export interface StateSummary {
  /** Lowercase slug, e.g. `va`. Also the data folder name. */
  id: string
  name: string
  /** Two-letter abbreviation, e.g. `VA`. */
  abbr: string
  /** Path (relative to `data/`) to this state's config file. */
  config: string
}

/** The index that lists every available state. */
export interface StatesIndex {
  version: number
  /** Id of the state to use when none is chosen yet. */
  default: string
  states: StateSummary[]
}

/** Per-state config: branding, copy, exam rules, and data file locations. */
export interface StateConfig {
  version: number
  id: string
  name: string
  abbr: string
  /** Licensing agency, e.g. "Virginia DMV". */
  agency: string
  /** Header / nav branding strings. */
  brand: {
    /** Short badge in the app bar, e.g. "VA". */
    mark: string
    /** Product name shown next to the badge. */
    appName: string
    /** Pill shown in the app bar, e.g. "Virginia DMV". */
    agencyPill: string
  }
  /** Home-screen hero copy. */
  home: {
    eyebrow: string
    heading: string
  }
  /** Exam structure (counts / pass threshold). */
  exam: ExamConfig
  /** Source manual attribution + link. */
  manual: {
    source: string
    sourceUrl: string
  }
  /** Paths (relative to `data/`) to this state's content files. */
  data: {
    manual: string
    questions: string
    signs: string
  }
}
