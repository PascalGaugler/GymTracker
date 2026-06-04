import { differenceInCalendarDays } from "date-fns"

import type { Measurement, MeasurementUnit } from "@/data/schema"

// Presentation math for the dashboard readouts. Pure functions over a single
// measurement type's time series — no Dexie, no React — so they are unit-tested
// in isolation. The recomposition / strength-index math is deliberately NOT here
// (Phase 5); this file only does the simple bodyweight/circumference readouts.

export type TrendDir = "up" | "down" | "flat"

export interface MeasurementSummary {
  /** Most recent recorded value. */
  latest: number
  unit: MeasurementUnit
  /** latest − first recorded value (since tracking began); negative = down. */
  changeSinceStart: number
  /** Recent pace in units/week (least-squares fit); null until 2+ distinct days. */
  ratePerWeek: number | null
  /** Number of points in the series. */
  count: number
}

const MS_PER_DAY = 86_400_000

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// Direction of a delta, with a dead-band so noise reads as "flat". A null delta
// (not enough data) is treated as flat.
export function trendDir(delta: number | null, epsilon = 0): TrendDir {
  if (delta == null || Math.abs(delta) <= epsilon) return "flat"
  return delta > 0 ? "up" : "down"
}

// Weekly rate via ordinary least squares over a trailing window (default ~1
// month, the rate the user cares about mid-cut). Falls back to the whole series
// when the window holds fewer than 2 points. Returns null when the points share
// a single instant (slope undefined) or there are fewer than 2 points.
export function weeklyRate(series: Measurement[], windowDays = 30): number | null {
  if (series.length < 2) return null

  const last = series[series.length - 1]
  const windowed = series.filter(
    (m) => differenceInCalendarDays(last.measuredAt, m.measuredAt) <= windowDays,
  )
  const points = windowed.length >= 2 ? windowed : series

  const t0 = points[0].measuredAt.getTime()
  const xs = points.map((p) => (p.measuredAt.getTime() - t0) / MS_PER_DAY)
  const ys = points.map((p) => p.value)
  const n = points.length
  const xMean = xs.reduce((a, b) => a + b, 0) / n
  const yMean = ys.reduce((a, b) => a + b, 0) / n

  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean)
    den += (xs[i] - xMean) ** 2
  }
  if (den === 0) return null

  return round2((num / den) * 7)
}

// Collapse one measurement type's series into the dashboard readout. Sorts
// defensively by time; the repository already returns ascending order.
export function summarizeSeries(
  series: Measurement[],
  windowDays = 30,
): MeasurementSummary | null {
  if (series.length === 0) return null

  const sorted = [...series].sort(
    (a, b) => a.measuredAt.getTime() - b.measuredAt.getTime(),
  )
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  return {
    latest: last.value,
    unit: last.unit,
    changeSinceStart: round2(last.value - first.value),
    ratePerWeek: weeklyRate(sorted, windowDays),
    count: sorted.length,
  }
}
