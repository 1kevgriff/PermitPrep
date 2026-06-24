import type { ExamConfig } from '@/types/exam'

/**
 * Mirrors the `exam` block of `public/data/va/config.v1.json`. Kept as a plain
 * constant so unit tests stay independent of the data-loading machinery.
 */
export const VA_EXAM_CONFIG: ExamConfig = {
  signCount: 10,
  generalCount: 25,
  generalPassPct: 80,
}
