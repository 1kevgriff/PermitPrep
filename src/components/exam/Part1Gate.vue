<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ correct: number; total: number }>()
const emit = defineEmits<{ advance: []; restart: [] }>()

/** The real VA exam requires ALL Part 1 sign questions correct to continue. */
const passed = computed(() => props.total > 0 && props.correct === props.total)
</script>

<template>
  <div class="card center stack gate">
    <div class="gate__badge" :class="passed ? 'gate__badge--ok' : 'gate__badge--no'">
      {{ correct }}/{{ total }}
    </div>
    <template v-if="passed">
      <h2>Part 1 passed!</h2>
      <p class="muted">You identified all {{ total }} traffic signs correctly. On to general knowledge.</p>
      <button class="btn btn--green btn--lg btn--block" @click="emit('advance')">
        Continue to Part 2
      </button>
    </template>
    <template v-else>
      <h2>Part 1 not passed</h2>
      <p class="muted">
        You must get all {{ total }} traffic-sign questions correct to move on. You got
        {{ correct }}. Keep studying the signs and try again.
      </p>
      <button class="btn btn--lg btn--block" @click="emit('restart')">Restart exam</button>
    </template>
  </div>
</template>

<style scoped>
.gate__badge {
  width: 88px;
  height: 88px;
  margin: 0 auto;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  font-weight: 900;
  color: #fff;
}
.gate__badge--ok {
  background: var(--green);
}
.gate__badge--no {
  background: var(--red);
}
</style>
