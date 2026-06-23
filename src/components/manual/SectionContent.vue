<script setup lang="ts">
import { useContentStore } from '@/stores/content'
import type { ManualSection } from '@/types/manual'
import SignImage from '@/components/question/SignImage.vue'
import { assetUrl } from '@/data/loaders'

defineProps<{ section: ManualSection }>()
const content = useContentStore()

function slugForHeading(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
</script>

<template>
  <div class="content">
    <template v-for="(block, i) in section.blocks" :key="i">
      <h3 v-if="block.type === 'heading'" :id="slugForHeading(block.text)" class="content__h">
        {{ block.text }}
      </h3>
      <p v-else-if="block.type === 'paragraph'" class="content__p">{{ block.text }}</p>
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
