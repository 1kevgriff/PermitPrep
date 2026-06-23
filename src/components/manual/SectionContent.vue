<script setup lang="ts">
import { computed } from 'vue'
import { useContentStore } from '@/stores/content'
import type { ManualSection, ManualBlock } from '@/types/manual'
import SignImage from '@/components/question/SignImage.vue'
import { assetUrl } from '@/data/loaders'

const props = defineProps<{ section: ManualSection }>()
const content = useContentStore()

function slugForHeading(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// The PDF extraction emits list items as paragraphs prefixed with a stray
// bullet marker — usually a C0 control char (ETB, U+0017), sometimes a real
// bullet glyph. Detect that marker, strip it, and group consecutive items
// into a single real list so they render as a proper bulleted list.
const BULLET_CHARS = '\\u0000-\\u001f\\u2022\\u00b7\\u2023\\u25aa\\u25cf'
const BULLET_MARKER = new RegExp(`^[${BULLET_CHARS}]`)
const BULLET_STRIP = new RegExp(`^[\\s${BULLET_CHARS}]+`)
function bulletText(text: string): string | null {
  return BULLET_MARKER.test(text) ? text.replace(BULLET_STRIP, '').trim() : null
}

type RenderBlock = ManualBlock | { type: 'list'; items: string[] }
const renderBlocks = computed<RenderBlock[]>(() => {
  const out: RenderBlock[] = []
  for (const block of props.section.blocks) {
    const item = block.type === 'paragraph' ? bulletText(block.text) : null
    if (item) {
      const last = out[out.length - 1]
      if (last && last.type === 'list') last.items.push(item)
      else out.push({ type: 'list', items: [item] })
    } else {
      out.push(block)
    }
  }
  return out
})
</script>

<template>
  <div class="content">
    <template v-for="(block, i) in renderBlocks" :key="i">
      <h3 v-if="block.type === 'heading'" :id="slugForHeading(block.text)" class="content__h">
        {{ block.text }}
      </h3>
      <p v-else-if="block.type === 'paragraph'" class="content__p">{{ block.text }}</p>
      <ul v-else-if="block.type === 'list'" class="content__list">
        <li v-for="(item, j) in block.items" :key="j">{{ item }}</li>
      </ul>
      <figure v-else-if="block.type === 'sign'" class="content__sign">
        <template v-if="content.signById.get(block.signId)">
          <SignImage :src="content.signById.get(block.signId)!.image" :alt="content.signById.get(block.signId)!.name" />
          <figcaption>
            <strong>{{ content.signById.get(block.signId)!.name }}</strong>
            <span class="muted"> — {{ content.signById.get(block.signId)!.meaning }}</span>
          </figcaption>
        </template>
      </figure>
      <figure v-else-if="block.type === 'image'" class="content__img">
        <img :src="assetUrl(block.src)" :alt="block.caption || 'Diagram from the manual'" loading="lazy" />
        <figcaption v-if="block.caption" class="muted">{{ block.caption }}</figcaption>
      </figure>
    </template>
  </div>
</template>

<style scoped>
.content__h {
  margin-top: 20px;
  font-size: 1.15rem;
  color: var(--blue-dark);
  scroll-margin-top: 70px;
}
.content__p {
  margin: 10px 0;
}
.content__list {
  margin: 10px 0;
  padding-left: 20px;
}
.content__list li {
  margin: 6px 0;
  line-height: 1.5;
}
.content__list li::marker {
  color: var(--green);
}
.content__sign {
  margin: 16px 0;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--bg);
}
.content__sign figcaption {
  text-align: center;
}
.content__img {
  margin: 16px 0;
}
.content__img img {
  max-width: 100%;
  border-radius: 10px;
  border: 1px solid var(--line);
}
</style>
