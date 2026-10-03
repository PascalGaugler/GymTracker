import type { ExerciseDataPoint } from "@/data/repositories"

import { customWeightAxis } from "./axis"

// Single-exercise drilldown math: collapse one exercise's logged sets into a
// per-session top-set line with a min–max BAND (the spread of that session's
// sets — working weight + fatigue drop-off, per docs/charts.md). Pure over the
// flat per-set history the repository returns; presentation logic, so it lives
// in the analysis feature, not a repo.

/** One session's row: the top set (line) and the [min, max] band. */
export interface DrilldownPoint {
  t: number
  /** Heaviest set of the session — the line (and the band's upper edge). */
  top: number
  /** Lightest set of the session — the band's lower edge. */
  min: number
  /** [min, max] tuple driving the range area. */
  band: [number, number]
}

export interface DrilldownData {
  points: DrilldownPoint[]
  yDomain: [number, number]
  yTicks: number[]
  sessionCount: number
  /** Top set of the most recent session; null with no history. */
  latestTop: number | null
  /** Latest top set minus the FIRST session's top set (fixed start, never rolling); null under 2 sessions. */
  changeSinceStart: number | null
}

/** Group the exercise's sets by session, then derive top + min–max per session. */
export function buildExerciseDrilldown(history: ExerciseDataPoint[]): DrilldownData {
  const bySession = new Map<string, { t: number; weights: number[] }>()
  for (const p of history) {
    const group = bySession.get(p.sessionId)
    if (group) group.weights.push(p.weight)
    else bySession.set(p.sessionId, { t: p.date.getTime(), weights: [p.weight] })
  }

  const points: DrilldownPoint[] = [...bySession.values()]
    .map(({ t, weights }) => {
      const min = Math.min(...weights)
      const max = Math.max(...weights)
      return { t, top: max, min, band: [min, max] as [number, number] }
    })
    .sort((a, b) => a.t - b.t)

  const { domain, ticks } = customWeightAxis(points.flatMap((p) => [p.min, p.top]))

  const first = points[0]
  const last = points[points.length - 1]
  return {
    points,
    yDomain: domain,
    yTicks: ticks,
    sessionCount: points.length,
    latestTop: last ? last.top : null,
    // Rounded to kill float noise (e.g. 102.25 − 100 = 2.25 exactly, but 0.1+0.2 style sums).
    changeSinceStart: points.length >= 2 ? Math.round((last.top - first.top) * 100) / 100 : null,
  }
}
