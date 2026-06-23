<script setup lang="ts">
import ProgressBar from '@/components/common/ProgressBar.vue'

defineProps<{ part: 1 | 2; index: number; total: number }>()
</script>

<template>
  <div class="exam-progress">
    <div class="row" style="justify-content: space-between">
      <span class="pill">Part {{ part }} · {{ part === 1 ? 'Traffic Signs' : 'General Knowledge' }}</span>
      <span class="muted">Question {{ index + 1 }} of {{ total }}</span>
    </div>
    <ProgressBar :value="index + 1" :max="total" />
  </div>
</template>

<style scoped>
.exam-progress {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}
</style>
