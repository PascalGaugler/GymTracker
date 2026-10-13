import { differenceInCalendarDays } from "date-fns"

import type { Measurement, MeasurementType, MeasurementUnit } from "@/data/schema"

import { customWeightAxis } from "./axis"
import { weeklyRate } from "./stats"

export const MA_WINDOW_DAYS = 7
export const COMPARISON_BASELINE = 100

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

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

export function buildBodyweightTrend(measurements: Measurement[]): BodyweightTrend {
  const sorted = [...measurements].sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime())

  const points: BodyweightPoint[] = sorted.map((m, i) => {
    // Entries are time-sorted, so the day gap only grows: stop at the first one outside the window.
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
  present: Record<ComparisonType, boolean>
  /** Raw latest − first in cm, 1 decimal; null with fewer than 2 points. */
  changeSinceStart: Record<ComparisonType, number | null>
}

function rawChange(measurements: Measurement[]): number | null {
  if (measurements.length < 2) return null
  const sorted = [...measurements].sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime())
  return round1(sorted[sorted.length - 1].value - sorted[0].value)
}

function indexToBaseline(measurements: Measurement[]): { t: number; value: number }[] {
  if (measurements.length === 0) return []
  const sorted = [...measurements].sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime())
  const base = sorted[0].value
  if (base <= 0) return []
  return sorted.map((m) => ({
    t: m.measuredAt.getTime(),
    value: round1((m.value / base) * COMPARISON_BASELINE),
  }))
}

// Always include the 100 baseline so its reference line sits on the scale.
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
    changeSinceStart: {
      waist: rawChange(series.waist),
      chest: rawChange(series.chest),
      biceps: rawChange(series.biceps),
    },
  }
}
