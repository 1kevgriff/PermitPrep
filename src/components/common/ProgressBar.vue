<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: number; max: number; tone?: 'blue' | 'green' }>()
const pct = computed(() => (props.max <= 0 ? 0 : Math.round((props.value / props.max) * 100)))
</script>

<template>
  <div class="lane" role="progressbar" :aria-valuenow="value" :aria-valuemax="max">
    <div class="lane__dash" aria-hidden="true"></div>
    <div class="lane__fill" :class="`lane__fill--${tone ?? 'blue'}`" :style="{ width: pct + '%' }" />
  </div>
</template>

<style scoped>
.lane {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: #e7edf5;
  overflow: hidden;
}
/* dashed centre-line of the road */
.lane__dash {
  position: absolute;
  top: 50%;
  left: 8px;
  right: 8px;
  height: 2px;
  transform: translateY(-50%);
  background: repeating-linear-gradient(
    90deg,
    rgba(90, 107, 126, 0.35) 0 8px,
    transparent 8px 16px
  );
}
.lane__fill {
  position: relative;
  height: 100%;
  border-radius: 999px;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.lane__fill--blue {
  background: linear-gradient(90deg, var(--sky), var(--sky-dark));
}
.lane__fill--green {
  background: linear-gradient(90deg, #2bc066, var(--green));
}
</style>
