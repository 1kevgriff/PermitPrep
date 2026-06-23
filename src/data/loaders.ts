import type { QuestionBank } from '@/types/question'
import type { Manual, Sign } from '@/types/manual'

/** Base-aware URL for a file shipped in /public (works in dev and on Pages). */
function dataUrl(file: string): string {
  return `${import.meta.env.BASE_URL}data/${file}`
}

async function fetchJson<T>(file: string): Promise<T> {
  const res = await fetch(dataUrl(file))
  if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`)
  return (await res.json()) as T
}

let bankCache: Promise<QuestionBank> | null = null
let manualCache: Promise<Manual> | null = null
let signsCache: Promise<Sign[]> | null = null

export function loadQuestionBank(): Promise<QuestionBank> {
  return (bankCache ??= fetchJson<QuestionBank>('questions.v1.json'))
}

export function loadManual(): Promise<Manual> {
  return (manualCache ??= fetchJson<Manual>('manual.v1.json'))
}

export function loadSigns(): Promise<Sign[]> {
  return (signsCache ??= fetchJson<Sign[]>('signs.v1.json'))
}

/** Base-aware URL for an image shipped in /public/images. */
export function assetUrl(relativePath: string): string {
  return `${import.meta.env.BASE_URL}${relativePath}`
}
