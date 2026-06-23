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
  return ''
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
  min-height: var(--tap);
  padding: 12px 14px;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  background: #fff;
  color: var(--ink);
  font-size: 1rem;
  cursor: pointer;
}
.choice:disabled {
  cursor: default;
}
.choice__letter {
  display: grid;
  place-items: center;
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--blue-soft);
  color: var(--blue-dark);
  font-weight: 800;
  font-size: 0.9rem;
}
.choice--selected {
  border-color: var(--blue);
  background: var(--blue-soft);
}
.choice--correct {
  border-color: var(--green);
  background: var(--green-soft);
}
.choice--correct .choice__letter {
  background: var(--green);
  color: #fff;
}
.choice--wrong {
  border-color: var(--red);
  background: var(--red-soft);
}
.choice--wrong .choice__letter {
  background: var(--red);
  color: #fff;
}
</style>
