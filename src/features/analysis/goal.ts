import type { Measurement } from "@/data/schema"

// Bodyweight goal progress. Only the target is stored (settings); the start is
// DERIVED as the first bodyweight measurement and the current weight as the latest.
// Pure and unit-tested in isolation.

export interface GoalProgress {
  start: number
  target: number
  current: number
  /** Share of the way from start to target, clamped to 0–1. */
  progress: number
}

/**
 * Null (card shows no goal bar) when there is no target, no measurement, or the
 * target is not below the start weight (the goal is a cut).
 */
export function goalProgress(
  series: Measurement[],
  target: number | undefined,
): GoalProgress | null {
  if (target == null || series.length === 0) return null

  const sorted = [...series].sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime())
  const start = sorted[0].value
  const current = sorted[sorted.length - 1].value
  if (target >= start) return null

  const raw = (start - current) / (start - target)
  return { start, target, current, progress: Math.min(1, Math.max(0, raw)) }
}
