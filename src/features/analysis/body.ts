import { differenceInCalendarDays } from "date-fns"

import type { Measurement, MeasurementType, MeasurementUnit } from "@/data/schema"

import { customWeightAxis } from "./axis"
import { weeklyRate } from "./stats"

// Body chart math (docs/charts.md › Bodyweight / Measurements): the smoothed
// bodyweight trend (raw weigh-ins + a 7-day moving average + a kg/week rate) and
// the circumference comparison (waist vs. biceps/chest, each indexed to 100 at
// its own first value so "losing fat, keeping muscle" reads on one shared axis).
// Pure over the measurement series — no Dexie, no React — so the rules are
// unit-tested in isolation; this is presentation logic, not a repository.

/** Trailing window for the bodyweight moving average, per docs/charts.md. */
export const MA_WINDOW_DAYS = 7
/** Circumference series are indexed to this at their first recorded value. */
export const COMPARISON_BASELINE = 100

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

// --- Bodyweight trend ---

/** One weigh-in: the raw value (point) and the trailing 7-day average (line). */
export interface BodyweightPoint {
  t: number
  raw: number
  /** Mean of weigh-ins within the trailing {@link MA_WINDOW_DAYS} (inclusive). */
  ma: number
}

export interface BodyweightTrend {
  points: BodyweightPoint[]
  yDomain: [number, number]
  yTicks: number[]
  /** Recent pace in kg/week (least-squares); null until 2+ distinct days. */
  ratePerWeek: number | null
  latest: number | null
  /** latest − first weigh-in; null with fewer than 2 points. */
  changeSinceStart: number | null
  unit: MeasurementUnit
  count: number
}

/**
 * Bodyweight trend: raw weigh-ins plus a trailing 7-day moving average (daily
 * weights are noisy — water, food, timing — so the average, not the raw line,
 * tells the user if the deficit is working). The rate reuses the dashboard's
 * least-squares {@link weeklyRate}.
 */
export function buildBodyweightTrend(measurements: Measurement[]): BodyweightTrend {
  const sorted = [...measurements].sort(
    (a, b) => a.measuredAt.getTime() - b.measuredAt.getTime(),
  )

  const points: BodyweightPoint[] = sorted.map((m, i) => {
    // Walk back over the window; entries are time-sorted so the day-gap grows
    // monotonically and we can stop at the first one outside the window.
    let sum = 0
    let n = 0
    for (let j = i; j >= 0; j--) {
      if (differenceInCalendarDays(m.measuredAt, sorted[j].measuredAt) > MA_WINDOW_DAYS) break
      sum += sorted[j].value
      n++
    }
    return { t: m.measuredAt.getTime(), raw: m.value, ma: round1(sum / n) }
  })

  const { domain, ticks } = customWeightAxis(sorted.map((m) => m.value))

  return {
    points,
    yDomain: domain,
    yTicks: ticks,
    ratePerWeek: weeklyRate(sorted),
    latest: sorted.length > 0 ? sorted[sorted.length - 1].value : null,
    changeSinceStart:
      sorted.length > 1 ? round1(sorted[sorted.length - 1].value - sorted[0].value) : null,
    unit: sorted[0]?.unit ?? "cm",
    count: sorted.length,
  }
}

// --- Circumference comparison ---

/** The circumference types compared on the shared index axis. */
export type ComparisonType = Exclude<MeasurementType, "bodyweight">

/** Merged chart row; a series is null on dates where only another has a value. */
export interface ComparisonPoint {
  t: number
  waist: number | null
  chest: number | null
  biceps: number | null
}

export interface MeasurementComparison {
  points: ComparisonPoint[]
  yDomain: [number, number]
  yTicks: number[]
  /** Which series have data (drives which lines + legend entries render). */
  present: Record<ComparisonType, boolean>
}

/** Index one circumference series to 100 at its own first recorded value. */
function indexToBaseline(measurements: Measurement[]): { t: number; value: number }[] {
  if (measurements.length === 0) return []
  const sorted = [...measurements].sort(
    (a, b) => a.measuredAt.getTime() - b.measuredAt.getTime(),
  )
  const base = sorted[0].value
  if (base <= 0) return []
  return sorted.map((m) => ({
    t: m.measuredAt.getTime(),
    value: round1((m.value / base) * COMPARISON_BASELINE),
  }))
}

// Shared index axis: padded a little around the values, always including the 100
// baseline so the reference line and every series sit on one honest scale.
function indexAxis(values: number[]): { domain: [number, number]; ticks: number[] } {
  const min = Math.min(...values, COMPARISON_BASELINE)
  const max = Math.max(...values, COMPARISON_BASELINE)
  const lo = Math.floor((min - 2) / 5) * 5
  const hi = Math.ceil((max + 2) / 5) * 5
  const range = hi - lo
  const step = range <= 20 ? 5 : range <= 50 ? 10 : 20
  const ticks: number[] = []
  for (let v = lo; v <= hi; v += step) ticks.push(v)
  return { domain: [lo, hi], ticks }
}

/**
 * Circumference comparison: waist (fat proxy, should fall) vs. biceps/chest
 * (muscle proxy, should hold), each indexed to 100 at its own start on ONE shared
 * axis (the most direct visual of "losing fat, keeping muscle"). Independently
 * timestamped points are merged onto a shared time axis; the chart bridges the
 * gaps within each series.
 */
export function buildMeasurementComparison(
  series: Record<ComparisonType, Measurement[]>,
): MeasurementComparison {
  const indexed: Record<ComparisonType, { t: number; value: number }[]> = {
    waist: indexToBaseline(series.waist),
    chest: indexToBaseline(series.chest),
    biceps: indexToBaseline(series.biceps),
  }

  const byTimestamp = new Map<number, ComparisonPoint>()
  const rowAt = (t: number): ComparisonPoint => {
    let row = byTimestamp.get(t)
    if (!row) {
      row = { t, waist: null, chest: null, biceps: null }
      byTimestamp.set(t, row)
    }
    return row
  }

  const types: ComparisonType[] = ["waist", "chest", "biceps"]
  for (const type of types) {
    for (const p of indexed[type]) rowAt(p.t)[type] = p.value
  }

  const points = [...byTimestamp.values()].sort((a, b) => a.t - b.t)
  const { domain, ticks } = indexAxis(types.flatMap((type) => indexed[type].map((p) => p.value)))

  return {
    points,
    yDomain: domain,
    yTicks: ticks,
    present: {
      waist: indexed.waist.length > 0,
      chest: indexed.chest.length > 0,
      biceps: indexed.biceps.length > 0,
    },
  }
}
