import { describe, expect, it } from "vitest"

import type { Measurement, MeasurementType, MeasurementUnit } from "@/data/schema"

import { buildBodyweightTrend, buildMeasurementComparison } from "./body"

const DAY = 86_400_000
const T0 = new Date("2026-01-01T08:00:00").getTime()

function day(n: number): Date {
  return new Date(T0 + n * DAY)
}

function m(type: MeasurementType, unit: MeasurementUnit, dayN: number, value: number): Measurement {
  return { id: `${type}-${dayN}`, type, unit, value, measuredAt: day(dayN), source: "manual" }
}

const bw = (dayN: number, value: number) => m("bodyweight", "kg", dayN, value)

describe("buildBodyweightTrend", () => {
  it("returns an empty, safe result for no weigh-ins", () => {
    const trend = buildBodyweightTrend([])
    expect(trend.points).toEqual([])
    expect(trend.count).toBe(0)
    expect(trend.latest).toBeNull()
    expect(trend.ratePerWeek).toBeNull()
    expect(trend.changeSinceStart).toBeNull()
  })

  it("emits raw points sorted by date with latest + change since start", () => {
    const trend = buildBodyweightTrend([bw(6, 84), bw(0, 86), bw(3, 85)])
    expect(trend.points.map((p) => p.raw)).toEqual([86, 85, 84])
    expect(trend.latest).toBe(84)
    expect(trend.changeSinceStart).toBe(-2)
    expect(trend.count).toBe(3)
  })

  it("averages only weigh-ins within the trailing 7-day window", () => {
    // day 0,1,2 inside the window for day 2; day 10 starts a fresh window.
    const trend = buildBodyweightTrend([bw(0, 90), bw(1, 88), bw(2, 86), bw(10, 80)])
    expect(trend.points[0].ma).toBe(90) // only itself
    expect(trend.points[1].ma).toBe(89) // (90+88)/2
    expect(trend.points[2].ma).toBe(88) // (90+88+86)/3
    expect(trend.points[3].ma).toBe(80) // day 3..9 absent, day 0-2 out of window
  })

  it("computes a downward weekly rate during a cut", () => {
    const trend = buildBodyweightTrend([bw(0, 90), bw(7, 89), bw(14, 88)])
    expect(trend.ratePerWeek).not.toBeNull()
    expect(trend.ratePerWeek as number).toBeLessThan(0)
  })
})

describe("buildMeasurementComparison", () => {
  const empty = { waist: [], chest: [], biceps: [] }

  it("flags every series absent when there is no data", () => {
    const cmp = buildMeasurementComparison(empty)
    expect(cmp.points).toEqual([])
    expect(cmp.present).toEqual({ waist: false, chest: false, biceps: false })
  })

  it("indexes each series to 100 at its own first value on a shared axis", () => {
    const cmp = buildMeasurementComparison({
      ...empty,
      waist: [m("waist", "cm", 0, 90), m("waist", "cm", 28, 81)], // −10% → 90
      chest: [m("chest", "cm", 0, 100), m("chest", "cm", 28, 101)], // +1% → 101
    })
    expect(cmp.present).toEqual({ waist: true, chest: true, biceps: false })
    expect(cmp.points[0]).toEqual({ t: day(0).getTime(), waist: 100, chest: 100, biceps: null })
    expect(cmp.points[1]).toEqual({ t: day(28).getTime(), waist: 90, chest: 101, biceps: null })
    // Axis brackets the lowest (90) and the 100 baseline.
    expect(cmp.yDomain[0]).toBeLessThanOrEqual(90)
    expect(cmp.yDomain[1]).toBeGreaterThanOrEqual(100)
  })

  it("merges independently timestamped series onto one sorted time axis", () => {
    const cmp = buildMeasurementComparison({
      ...empty,
      waist: [m("waist", "cm", 0, 90)],
      biceps: [m("biceps", "cm", 14, 38)],
    })
    expect(cmp.points.map((p) => p.t)).toEqual([day(0).getTime(), day(14).getTime()])
    expect(cmp.points[0]).toMatchObject({ waist: 100, biceps: null })
    expect(cmp.points[1]).toMatchObject({ waist: null, biceps: 100 })
  })
})
