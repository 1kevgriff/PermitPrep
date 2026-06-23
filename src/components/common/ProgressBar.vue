<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: number; max: number; tone?: 'blue' | 'green' }>()
const pct = computed(() => (props.max <= 0 ? 0 : Math.round((props.value / props.max) * 100)))
</script>

<template>
  <div class="bar" role="progressbar" :aria-valuenow="value" :aria-valuemax="max">
    <div class="bar__fill" :class="`bar__fill--${tone ?? 'blue'}`" :style="{ width: pct + '%' }" />
  </div>
</template>

<style scoped>
.bar {
  height: 8px;
  border-radius: 999px;
  background: var(--line);
  overflow: hidden;
}
.bar__fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.25s ease;
}
.bar__fill--blue {
  background: var(--blue);
}
.bar__fill--green {
  background: var(--green);
}
</style>
