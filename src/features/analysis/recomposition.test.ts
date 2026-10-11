import { describe, expect, it } from "vitest"

import type { Measurement, WorkoutSession } from "@/data/schema"

import {
  bodyweightIndexSeries,
  buildRecomposition,
  strengthIndexSeries,
  trailingMean,
} from "./recomposition"

const DAY = 86_400_000
const T0 = new Date("2026-01-01T10:00:00").getTime()

function day(n: number): Date {
  return new Date(T0 + n * DAY)
}

// A session logging one exercise, whose top set is `top` (plus a lighter set so
// the heaviest, not the average, is exercised).
function session(exerciseId: string, dayN: number, top: number): WorkoutSession {
  return {
    id: crypto.randomUUID(),
    workoutId: "w",
    date: day(dayN),
    sets: [
      { id: crypto.randomUUID(), exerciseId, setNumber: 1, weight: top - 5 },
      { id: crypto.randomUUID(), exerciseId, setNumber: 2, weight: top },
    ],
  }
}

function bw(value: number, dayN: number): Measurement {
  return {
    id: crypto.randomUUID(),
    type: "bodyweight",
    value,
    unit: "kg",
    measuredAt: day(dayN),
    source: "manual",
  }
}

describe("strengthIndexSeries", () => {
  it("returns nothing without sessions", () => {
    expect(strengthIndexSeries([])).toEqual([])
  })

  it("indexes top sets to the median of the first 2-3 sessions", () => {
    const ex = "A"
    // Baseline = median(100, 102, 104) = 102. Top sets: 100,102,104,110.
    const series = strengthIndexSeries([
      session(ex, 0, 100),
      session(ex, 3, 102),
      session(ex, 6, 104),
      session(ex, 9, 110),
    ])
    expect(series.map((p) => p.value)).toEqual([98, 100, 102, 107.8])
  })

  it("uses only the heaviest set of the session as the progression value", () => {
    const ex = "A"
    const s = session(ex, 0, 80) // sets 75 + 80 → top 80
    expect(strengthIndexSeries([s])).toEqual([{ t: day(0).getTime(), value: 100 }])
  })

  it("averages exercises equally (a small lift's +10% counts like a big one's)", () => {
    // A (big) and B (small) share four sessions: flat through the baseline
    // window, then both +10%. Baselines are A=100, B=20 → each reads 110% in the
    // final session, so the workout index is 110 regardless of absolute load.
    const a = "A"
    const b = "B"
    const both = (dayN: number, wa: number, wb: number): WorkoutSession => ({
      id: crypto.randomUUID(),
      workoutId: "w",
      date: day(dayN),
      sets: [
        { id: crypto.randomUUID(), exerciseId: a, setNumber: 1, weight: wa },
        { id: crypto.randomUUID(), exerciseId: b, setNumber: 1, weight: wb },
      ],
    })
    const series = strengthIndexSeries([
      both(0, 100, 20),
      both(3, 100, 20),
      both(6, 100, 20),
      both(9, 110, 22),
    ])
    expect(series.map((p) => p.value)).toEqual([100, 100, 100, 110])
  })

  it("ignores unweighted (0 kg) loads that cannot be indexed", () => {
    const ex = "A"
    const s: WorkoutSession = {
      id: crypto.randomUUID(),
      workoutId: "w",
      date: day(0),
      sets: [{ id: crypto.randomUUID(), exerciseId: ex, setNumber: 1, weight: 0 }],
    }
    expect(strengthIndexSeries([s])).toEqual([])
  })
})

describe("bodyweightIndexSeries", () => {
  it("returns nothing without measurements", () => {
    expect(bodyweightIndexSeries([], null)).toEqual([])
  })

  it("indexes to the mean of weigh-ins within the baseline window", () => {
    // Baseline window ends at day 6; readings 90 (d0) + 88 (d3) → base 89.
    const series = bodyweightIndexSeries([bw(90, 0), bw(88, 3), bw(85, 10)], day(6).getTime())
    expect(series.map((p) => p.value)).toEqual([101.1, 98.9, 95.5])
  })

  it("falls back to the earliest weigh-in when none predate the window", () => {
    const series = bodyweightIndexSeries([bw(80, 5), bw(78, 8)], day(0).getTime())
    expect(series[0].value).toBe(100)
    expect(series[1].value).toBe(97.5)
  })
})

describe("buildRecomposition", () => {
  it("reports no data for empty inputs", () => {
    const data = buildRecomposition([], [])
    expect(data.points).toEqual([])
    expect(data.hasStrength).toBe(false)
    expect(data.hasBodyweight).toBe(false)
    expect(data.latestStrengthIndex).toBeNull()
    expect(data.latestBodyweightIndex).toBeNull()
  })

  it("merges both series onto one shared axis and exposes the latest index", () => {
    const ex = "A"
    const data = buildRecomposition(
      [session(ex, 0, 100), session(ex, 3, 105)],
      [bw(90, 1), bw(88, 4)],
    )
    expect(data.hasStrength).toBe(true)
    expect(data.hasBodyweight).toBe(true)
    // Four distinct timestamps (two sessions + two weigh-ins), sorted.
    expect(data.points.map((p) => p.t)).toEqual([
      day(0).getTime(),
      day(1).getTime(),
      day(3).getTime(),
      day(4).getTime(),
    ])
    // Each row only carries its own series.
    expect(data.points[0].strength).not.toBeNull()
    expect(data.points[0].bodyweight).toBeNull()
    expect(data.points[1].strength).toBeNull()
    expect(data.points[1].bodyweight).not.toBeNull()
    expect(data.latestStrengthIndex).toBe(data.points[2].strength)
    expect(data.latestBodyweightIndex).toBe(data.points[3].bodyweight)
    // Shared axis brackets the 100 baseline.
    expect(data.yDomain[0]).toBeLessThanOrEqual(100)
    expect(data.yDomain[1]).toBeGreaterThanOrEqual(100)
  })
})

describe("strength display smoothing", () => {
  const ex = "A"
  // Tops 100,100,100 (fixed baseline 100) then 110, 120, 90.
  const sessions = [100, 100, 100, 110, 120, 90].map((top, i) => session(ex, i * 2, top))

  it("trailing mean uses fewer points at the start", () => {
    expect(trailingMean([100, 110, 120, 130])).toEqual([100, 105, 110, 120])
    expect(trailingMean([])).toEqual([])
  })

  it("leaves the raw strength, baseline and latest index untouched", () => {
    const data = buildRecomposition(sessions, [])
    const raw = strengthIndexSeries(sessions).map((p) => p.value)
    expect(data.points.map((p) => p.strength)).toEqual(raw)
    expect(raw.slice(0, 3)).toEqual([100, 100, 100])
    expect(data.latestStrengthIndex).toBe(90)
    // Smoothed differs from raw, proving the two are independent.
    expect(data.points[5].strengthDisplay).toBe(106.7)
  })

  it("smooths the first points over what is available", () => {
    const data = buildRecomposition(sessions, [])
    expect(data.points[0].strengthDisplay).toBe(100)
    expect(data.points[3].strengthDisplay).toBe(103.3)
  })

  it("skips weigh-in-only rows: the window spans the last 3 sessions", () => {
    const data = buildRecomposition(sessions, [bw(90, 1), bw(89, 7)])
    const weighInOnly = data.points.filter((p) => p.strength == null)
    expect(weighInOnly).toHaveLength(2)
    for (const p of weighInOnly) expect(p.strengthDisplay).toBeNull()
    expect(data.points.filter((p) => p.strength != null).at(-1)?.strengthDisplay).toBe(106.7)
  })
})
