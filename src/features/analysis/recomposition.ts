import type { Measurement, WorkoutSession } from "@/data/schema"

// Index BOTH strength index and bodyweight to 100 at a FIXED baseline on one shared axis (docs/charts.md).

export const BASELINE_SESSION_COUNT = 3
export const BASELINE_INDEX = 100
/** Display smoothing window: trailing mean over this many strength-index points. */
export const STRENGTH_SMOOTHING_WINDOW = 3

export interface IndexPoint {
  t: number
  value: number
}

/** Merged chart row; a series is null on dates where only the other has data. */
export interface RecompositionPoint {
  t: number
  /** Raw (unsmoothed) strength index; the source of truth for every number shown. */
  strength: number | null
  /** DISPLAY ONLY: trailing mean of the last 3 strength points; plotted, never used for metrics. */
  strengthDisplay: number | null
  bodyweight: number | null
  // TOOLTIP ONLY: each series' last non-null value at or before t (null before its first point).
  strengthDisplayAsOf: number | null
  strengthAsOf: number | null
  bodyweightAsOf: number | null
}

export interface RecompositionData {
  points: RecompositionPoint[]
  yDomain: [number, number]
  yTicks: number[]
  hasStrength: boolean
  hasBodyweight: boolean
  latestStrengthIndex: number | null
  latestBodyweightIndex: number | null
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

/**
 * Trailing mean over the last 3 strength points, one per SESSION (weigh-in-only dates are skipped).
 * DISPLAY ONLY: applied after indexing, never feeds the baseline or any metric.
 */
export function trailingMean(values: number[]): number[] {
  return values.map((_, i) =>
    round1(mean(values.slice(Math.max(0, i - STRENGTH_SMOOTHING_WINDOW + 1), i + 1))),
  )
}

// Median (outlier-robust) for the fixed baseline.
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// Heaviest set per exercise in a session (top set, not average). Sessions arrive sorted asc.
// Exported so strengthProgression reuses one definition.
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
 * One point per session = mean of its exercises' `(topSet / baseline) * 100`. Baselines are FIXED (median of
 * the first {@link BASELINE_SESSION_COUNT} top sets); an exercise enters only once it has one, so a
 * changing roster doesn't jolt the line.
 */
export function strengthIndexSeries(sessions: WorkoutSession[]): IndexPoint[] {
  if (sessions.length === 0) return []
  const sorted = [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime())
  const perSession = topSetsPerSession(sorted)

  // Loads of 0 (e.g. unweighted bodyweight) can't be indexed.
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
  const sorted = [...measurements].sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime())

  const inWindow =
    baselineEnd != null ? sorted.filter((m) => m.measuredAt.getTime() <= baselineEnd) : []
  const base = inWindow.length > 0 ? mean(inWindow.map((m) => m.value)) : sorted[0].value
  if (base <= 0) return []

  return sorted.map((m) => ({
    t: m.measuredAt.getTime(),
    value: round1((m.value / base) * BASELINE_INDEX),
  }))
}

// Always include the 100 baseline; padded so markers don't sit on the frame.
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

export function buildRecomposition(
  sessions: WorkoutSession[],
  bodyweight: Measurement[],
): RecompositionData {
  const sortedSessions = [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime())
  const strength = strengthIndexSeries(sortedSessions)

  const baselineEnd =
    sortedSessions.length > 0
      ? sortedSessions[Math.min(BASELINE_SESSION_COUNT, sortedSessions.length) - 1].date.getTime()
      : null
  const bw = bodyweightIndexSeries(bodyweight, baselineEnd)

  // Merge both series onto a shared time axis; null where a series has no value (chart uses connectNulls).
  const smoothed = trailingMean(strength.map((p) => p.value))
  const byTimestamp = new Map<number, RecompositionPoint>()
  strength.forEach((p, i) => {
    byTimestamp.set(p.t, {
      t: p.t,
      strength: p.value,
      strengthDisplay: smoothed[i],
      bodyweight: null,
      strengthDisplayAsOf: null,
      strengthAsOf: null,
      bodyweightAsOf: null,
    })
  })
  for (const p of bw) {
    const existing = byTimestamp.get(p.t)
    if (existing) existing.bodyweight = p.value
    else {
      byTimestamp.set(p.t, {
        t: p.t,
        strength: null,
        strengthDisplay: null,
        bodyweight: p.value,
        strengthDisplayAsOf: null,
        strengthAsOf: null,
        bodyweightAsOf: null,
      })
    }
  }
  const points = [...byTimestamp.values()].sort((a, b) => a.t - b.t)

  // Forward-fill the "as of" fields so a tooltip on any date can show both series.
  let lastDisplay: number | null = null
  let lastStrength: number | null = null
  let lastBodyweight: number | null = null
  for (const point of points) {
    if (point.strengthDisplay != null) lastDisplay = point.strengthDisplay
    if (point.strength != null) lastStrength = point.strength
    if (point.bodyweight != null) lastBodyweight = point.bodyweight
    point.strengthDisplayAsOf = lastDisplay
    point.strengthAsOf = lastStrength
    point.bodyweightAsOf = lastBodyweight
  }

  const { domain, ticks } = niceAxis([...strength.map((p) => p.value), ...bw.map((p) => p.value)])

  return {
    points,
    yDomain: domain,
    yTicks: ticks,
    hasStrength: strength.length > 0,
    hasBodyweight: bw.length > 0,
    latestStrengthIndex: strength.length > 0 ? strength[strength.length - 1].value : null,
    latestBodyweightIndex: bw.length > 0 ? bw[bw.length - 1].value : null,
  }
}
