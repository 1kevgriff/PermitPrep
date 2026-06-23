<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import PracticeRunner from '@/components/practice/PracticeRunner.vue'

const session = useSessionStore()

function done(): void {
  session.clearPractice()
}

onBeforeRouteLeave(() => {
  // Practice progress isn't a graded attempt; just clear the transient session.
  session.clearPractice()
  return true
})
</script>

<template>
  <PracticeRunner>
    <template #done>
      <div class="grid grid--2">
        <RouterLink to="/practice" class="btn btn--block" @click="done">New practice set</RouterLink>
        <RouterLink to="/" class="btn btn--ghost btn--block" @click="done">Home</RouterLink>
      </div>
    </template>
    <template #empty>
      <RouterLink to="/practice" class="btn">Set up practice</RouterLink>
    </template>
  </PracticeRunner>
</template>
