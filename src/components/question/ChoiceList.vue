<script setup lang="ts">
const props = defineProps<{
  choices: string[]
  selectedIndex: number | null
  /** When set (and revealed), highlights the correct/incorrect choices. */
  answerIndex?: number
  revealed?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{ select: [index: number] }>()

const letters = ['A', 'B', 'C', 'D', 'E', 'F']

function classFor(index: number): string {
  if (!props.revealed) {
    return props.selectedIndex === index ? 'choice--selected' : ''
  }
  if (index === props.answerIndex) return 'choice--correct'
  if (index === props.selectedIndex) return 'choice--wrong'
  return 'choice--muted'
}

function showMark(index: number): 'ok' | 'no' | null {
  if (!props.revealed) return null
  if (index === props.answerIndex) return 'ok'
  if (index === props.selectedIndex) return 'no'
  return null
}
</script>

<template>
  <ul class="choices">
    <li v-for="(choice, index) in choices" :key="index">
      <button
        type="button"
        class="choice"
        :class="classFor(index)"
        :disabled="disabled || revealed"
        :aria-pressed="selectedIndex === index"
        @click="emit('select', index)"
      >
        <span class="choice__letter">{{ letters[index] }}</span>
        <span class="choice__text">{{ choice }}</span>
        <span v-if="showMark(index)" class="choice__mark" :class="`choice__mark--${showMark(index)}`" aria-hidden="true">
          <svg v-if="showMark(index) === 'ok'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7" /></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.choices {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}
.choice {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  min-height: 56px;
  padding: 12px 14px;
  border: 2px solid var(--line);
  border-radius: 14px;
  background: #fff;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition:
    border-color 0.14s ease,
    background 0.14s ease,
    transform 0.08s ease,
    box-shadow 0.14s ease;
}
.choice:not(:disabled):hover {
  border-color: #c4d2e4;
}
.choice:not(:disabled):active {
  transform: scale(0.99);
}
.choice:focus-visible {
  outline: 3px solid var(--amber);
  outline-offset: 2px;
}
.choice:disabled {
  cursor: default;
}
.choice__letter {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--sky-soft);
  color: var(--sky-dark);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.92rem;
  transition:
    background 0.14s ease,
    color 0.14s ease;
}
.choice__text {
  flex: 1;
}
.choice__mark {
  flex: none;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  color: #fff;
  animation: pop-in 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.choice__mark--ok {
  background: var(--green);
}
.choice__mark--no {
  background: var(--red);
}

.choice--selected {
  border-color: var(--sky);
  background: var(--sky-soft);
}
.choice--selected .choice__letter {
  background: var(--sky);
  color: #fff;
}

.choice--correct {
  border-color: var(--green);
  background: var(--green-soft);
  animation: pop-in 0.34s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.choice--correct .choice__letter {
  background: var(--green);
  color: #fff;
}
.choice--wrong {
  border-color: var(--red);
  background: var(--red-soft);
  animation: shake 0.4s ease both;
}
.choice--wrong .choice__letter {
  background: var(--red);
  color: #fff;
}
.choice--muted {
  opacity: 0.55;
}
</style>
