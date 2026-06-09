import type { Measurement, WorkoutSession } from "@/data/schema"

// Recomposition (hero chart) math: index BOTH the strength index and bodyweight
// to 100 at a FIXED baseline and plot them on one shared axis. Pure functions
// over sessions + bodyweight measurements — no Dexie, no React — so the metric
// rules (docs/charts.md) are unit-tested in isolation. This is presentation
// logic and deliberately lives in the analysis feature, not in a repository.

/** An exercise's baseline = the median of its first N session top sets. */
export const BASELINE_SESSION_COUNT = 3
/** Both series are anchored to 100 at the baseline. */
export const BASELINE_INDEX = 100

/** A single indexed point: timestamp (x) + value where 100 = baseline. */
export interface IndexPoint {
  t: number
  value: number
}

/** Merged chart row; a series is null on dates where only the other has data. */
export interface RecompositionPoint {
  t: number
  strength: number | null
  bodyweight: number | null
}

export interface RecompositionData {
  points: RecompositionPoint[]
  /** Shared y-axis bounds (both series live on this one scale). */
  yDomain: [number, number]
  yTicks: number[]
  hasStrength: boolean
  hasBodyweight: boolean
  /** Most recent strength-index value, for the dashboard card. */
  latestStrengthIndex: number | null
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

// Median (outlier-robust) for the fixed baseline, per docs/charts.md.
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// The heaviest set of each exercise in a session — the progression value
// (top set, not the average, per docs/charts.md). Sessions arrive sorted asc.
// Exported so the per-workout progression module reuses one top-set definition.
export function topSetsPerSession(
  sessions: WorkoutSession[],
): { date: Date; tops: Map<string, number> }[] {
  return sessions.map((session) => {
    const tops = new Map<string, number>()
    for (const set of session.sets) {
      const current = tops.get(set.exerciseId)
      if (current == null || set.weight > current) tops.set(set.exerciseId, set.weight)
    }
    return { date: session.date, tops }
  })
}

/**
 * Strength index over time: one point per session = the mean of its exercises'
 * `(topSet / baseline) * 100`. Each exercise's baseline is FIXED (median of its
 * first {@link BASELINE_SESSION_COUNT} top sets) so the trend accumulates rather
 * than hovering near 100. An exercise contributes only once it has a baseline
 * (≥1 logged session with a positive load) and naturally drops out when swapped
 * away (it stops appearing in later sessions), so a changing roster doesn't jolt
 * the line.
 */
export function strengthIndexSeries(sessions: WorkoutSession[]): IndexPoint[] {
  if (sessions.length === 0) return []
  const sorted = [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime())
  const perSession = topSetsPerSession(sorted)

  // Collect each exercise's top sets in chronological order, then fix a baseline
  // from its first few. Loads of 0 (e.g. unweighted bodyweight) can't be indexed.
  const history = new Map<string, number[]>()
  for (const { tops } of perSession) {
    for (const [exerciseId, weight] of tops) {
      if (weight <= 0) continue
      const arr = history.get(exerciseId)
      if (arr) arr.push(weight)
      else history.set(exerciseId, [weight])
    }
  }

  const baseline = new Map<string, number>()
  for (const [exerciseId, weights] of history) {
    baseline.set(exerciseId, median(weights.slice(0, BASELINE_SESSION_COUNT)))
  }

  const points: IndexPoint[] = []
  for (const { date, tops } of perSession) {
    const pcts: number[] = []
    for (const [exerciseId, weight] of tops) {
      const base = baseline.get(exerciseId)
      if (base != null && base > 0 && weight > 0) pcts.push((weight / base) * BASELINE_INDEX)
    }
    if (pcts.length > 0) points.push({ t: date.getTime(), value: round1(mean(pcts)) })
  }
  return points
}

/**
 * Bodyweight indexed to 100 at the SAME baseline window as the strength index.
 * Baseline = mean of weigh-ins up to {@link baselineEnd} (the date of the last
 * baseline session), falling back to the earliest weigh-in when none predate it.
 */
export function bodyweightIndexSeries(
  measurements: Measurement[],
  baselineEnd: number | null,
): IndexPoint[] {
  if (measurements.length === 0) return []
  const sorted = [...measurements].sort(
    (a, b) => a.measuredAt.getTime() - b.measuredAt.getTime(),
  )

  const inWindow =
    baselineEnd != null
      ? sorted.filter((m) => m.measuredAt.getTime() <= baselineEnd)
      : []
  const base = inWindow.length > 0 ? mean(inWindow.map((m) => m.value)) : sorted[0].value
  if (base <= 0) return []

  return sorted.map((m) => ({
    t: m.measuredAt.getTime(),
    value: round1((m.value / base) * BASELINE_INDEX),
  }))
}

// Nice shared-axis bounds + ticks around the indexed values (always including
// the 100 baseline). Padded a little so markers don't sit on the frame.
function niceAxis(values: number[]): { domain: [number, number]; ticks: number[] } {
  const min = Math.min(...values, BASELINE_INDEX)
  const max = Math.max(...values, BASELINE_INDEX)
  const lo = Math.floor((min - 2) / 5) * 5
  const hi = Math.ceil((max + 2) / 5) * 5
  const range = hi - lo
  const step = range <= 20 ? 5 : range <= 50 ? 10 : 20
  const ticks: number[] = []
  for (let v = lo; v <= hi; v += step) ticks.push(v)
  return { domain: [lo, hi], ticks }
}

/** Build the merged, indexed dataset for the recomposition chart. */
export function buildRecomposition(
  sessions: WorkoutSession[],
  bodyweight: Measurement[],
): RecompositionData {
  const sortedSessions = [...sessions].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  )
  const strength = strengthIndexSeries(sortedSessions)

  const baselineEnd =
    sortedSessions.length > 0
      ? sortedSessions[
          Math.min(BASELINE_SESSION_COUNT, sortedSessions.length) - 1
        ].date.getTime()
      : null
  const bw = bodyweightIndexSeries(bodyweight, baselineEnd)

  // Merge both series onto a shared time axis; each row carries whatever exists
  // for that instant (the chart bridges the nulls with connectNulls).
  const byTimestamp = new Map<number, RecompositionPoint>()
  for (const p of strength) {
    byTimestamp.set(p.t, { t: p.t, strength: p.value, bodyweight: null })
  }
  for (const p of bw) {
    const existing = byTimestamp.get(p.t)
    if (existing) existing.bodyweight = p.value
    else byTimestamp.set(p.t, { t: p.t, strength: null, bodyweight: p.value })
  }
  const points = [...byTimestamp.values()].sort((a, b) => a.t - b.t)

  const { domain, ticks } = niceAxis([
    ...strength.map((p) => p.value),
    ...bw.map((p) => p.value),
  ])

  return {
    points,
    yDomain: domain,
    yTicks: ticks,
    hasStrength: strength.length > 0,
    hasBodyweight: bw.length > 0,
    latestStrengthIndex: strength.length > 0 ? strength[strength.length - 1].value : null,
  }
}
