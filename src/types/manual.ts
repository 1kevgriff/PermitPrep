export type ManualBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'sign'; signId: string }
  | { type: 'image'; src: string; caption: string }

export interface ManualSection {
  id: string
  slug: string
  number: number
  title: string
  blocks: ManualBlock[]
}

export interface Manual {
  version: number
  source: string
  sections: ManualSection[]
}

export type SignCategory =
  | 'shape'
  | 'signal'
  | 'regulatory'
  | 'warning'
  | 'workzone'

export interface Sign {
  signId: string
  name: string
  meaning: string
  category: SignCategory
  image: string
  page: number
  printedPage: number
}
