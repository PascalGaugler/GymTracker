import type { WorkoutSession } from "@/data/schema"

import { customWeightAxis } from "./axis"
import { topSetsPerSession } from "./recomposition"

// Per-workout strength progression: one line per exercise, value = the session
// TOP SET (heaviest set, per docs/charts.md). Swap-aware — a swapped exercise is
// a DIFFERENT catalog exercise, so it is its own series with NO bridging segment
// to the one it replaced (the merged rows carry null on dates an exercise was not
// logged, and the chart renders with connectNulls OFF). Pure functions over
// sessions; presentation logic, so it lives in the analysis feature, not a repo.

// Categorical chart palette (docs/design-system.md), cycled when a workout has
// more exercises than colours.
export const PROGRESSION_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
] as const

/** Display info for an exercise, resolved from the catalog by the caller. */
export interface ExerciseInfo {
  name: string
  unit: string
}

/** A single top-set point on one exercise's line. */
export interface ProgressionPoint {
  t: number
  top: number
}

/** One toggleable line: an exercise's top set over the workout's sessions. */
export interface ProgressionSeries {
  exerciseId: string
  name: string
  unit: string
  color: string
  points: ProgressionPoint[]
}

/** A merged chart row: one session timestamp, top set per exercise (null if not
 * logged that day) so swapped exercises never bridge across the gap. */
export type ProgressionRow = { t: number } & Record<string, number | null>

export interface ProgressionData {
  series: ProgressionSeries[]
  rows: ProgressionRow[]
  /** Shared raw-weight y-axis bounds + ticks. */
  yDomain: [number, number]
  yTicks: number[]
}

/**
 * Build the per-workout progression dataset from that workout's sessions.
 *
 * @param sessions   Sessions logged for the selected workout (any order).
 * @param slotOrder  The workout's current slot exercise ids, in plan order —
 *                   used only to order the series (current exercises first, then
 *                   any swapped-away exercises by first appearance).
 * @param infoOf     Resolves an exercise id to its display name + unit.
 */
export function buildStrengthProgression(
  sessions: WorkoutSession[],
  slotOrder: string[],
  infoOf: (exerciseId: string) => ExerciseInfo,
): ProgressionData {
  const sorted = [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime())
  const perSession = topSetsPerSession(sorted)

  // Collect each exercise's top-set points (positive loads only — a 0 kg
  // bodyweight top set is not a meaningful weight to plot) and when it first
  // appeared, for ordering swapped-away exercises.
  const pointsById = new Map<string, ProgressionPoint[]>()
  const firstSeen = new Map<string, number>()
  for (const { date, tops } of perSession) {
    const t = date.getTime()
    for (const [exerciseId, weight] of tops) {
      if (weight <= 0) continue
      const arr = pointsById.get(exerciseId)
      if (arr) arr.push({ t, top: weight })
      else {
        pointsById.set(exerciseId, [{ t, top: weight }])
        firstSeen.set(exerciseId, t)
      }
    }
  }

  // Series order: exercises still in the workout (in slot order) first, then any
  // exercises swapped away (no longer a slot) by first appearance.
  const inPlan = slotOrder.filter((id) => pointsById.has(id))
  const slotSet = new Set(slotOrder)
  const extras = [...pointsById.keys()]
    .filter((id) => !slotSet.has(id))
    .sort((a, b) => (firstSeen.get(a) ?? 0) - (firstSeen.get(b) ?? 0))
  const orderedIds = [...inPlan, ...extras]

  const series: ProgressionSeries[] = orderedIds.map((exerciseId, i) => {
    const info = infoOf(exerciseId)
    return {
      exerciseId,
      name: info.name,
      unit: info.unit,
      color: PROGRESSION_PALETTE[i % PROGRESSION_PALETTE.length],
      points: pointsById.get(exerciseId) ?? [],
    }
  })

  // One row per session timestamp; null where an exercise was not logged that
  // day so the chart (connectNulls off) never bridges a swap.
  const timestamps = [...new Set(perSession.map((s) => s.date.getTime()))].sort((a, b) => a - b)
  const rows: ProgressionRow[] = timestamps.map((t) => {
    const row: ProgressionRow = { t }
    for (const s of series) {
      row[s.exerciseId] = s.points.find((p) => p.t === t)?.top ?? null
    }
    return row
  })

  const { domain, ticks } = customWeightAxis(series.flatMap((s) => s.points.map((p) => p.top)))

  return { series, rows, yDomain: domain, yTicks: ticks }
}
