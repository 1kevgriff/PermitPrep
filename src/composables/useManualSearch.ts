import { computed, type Ref } from 'vue'
import { useContentStore } from '@/stores/content'
import type { ManualSection } from '@/types/manual'

export interface SearchHit {
  section: ManualSection
  matches: number
  snippet: string
}

function snippetAround(text: string, query: string): string {
  const i = text.toLowerCase().indexOf(query.toLowerCase())
  if (i < 0) return text.slice(0, 120)
  const start = Math.max(0, i - 40)
  const end = Math.min(text.length, i + query.length + 80)
  return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '')
}

/** Client-side substring search across manual section text. */
export function useManualSearch(query: Ref<string>) {
  const content = useContentStore()

  const results = computed<SearchHit[]>(() => {
    const q = query.value.trim().toLowerCase()
    if (q.length < 2) return []
    const hits: SearchHit[] = []
    for (const section of content.sections) {
      let matches = 0
      let snippet = ''
      for (const block of section.blocks) {
        const text = 'text' in block ? block.text : ''
        if (!text) continue
        const lower = text.toLowerCase()
        if (lower.includes(q)) {
          matches++
          if (!snippet) snippet = snippetAround(text, q)
        }
      }
      if (matches > 0) hits.push({ section, matches, snippet })
    }
    return hits.sort((a, b) => b.matches - a.matches)
  })

  return { results }
}
