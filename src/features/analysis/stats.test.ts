import { describe, expect, it } from "vitest"

import type { Measurement } from "@/data/schema"

import { summarizeSeries, trendDir, weeklyRate } from "./stats"

function bw(value: number, daysAgo: number): Measurement {
  return {
    id: crypto.randomUUID(),
    type: "bodyweight",
    value,
    unit: "kg",
    measuredAt: new Date(Date.now() - daysAgo * 86_400_000),
    source: "manual",
  }
}

describe("weeklyRate", () => {
  it("returns null with fewer than two points", () => {
    expect(weeklyRate([])).toBeNull()
    expect(weeklyRate([bw(80, 0)])).toBeNull()
  })

  it("computes a clean weekly loss from a linear series", () => {
    // 80 kg seven days ago, 79.5 kg now → −0.5 kg/week.
    const rate = weeklyRate([bw(80, 7), bw(79.5, 0)])
    expect(rate).toBeCloseTo(-0.5, 5)
  })

  it("computes a weekly gain", () => {
    // +1 kg over 14 days → +0.5 kg/week.
    const rate = weeklyRate([bw(80, 14), bw(81, 0)])
    expect(rate).toBeCloseTo(0.5, 5)
  })

  it("returns null when all points share one instant", () => {
    const same = bw(80, 0)
    expect(weeklyRate([same, { ...same, id: crypto.randomUUID(), value: 81 }])).toBeNull()
  })
})

describe("summarizeSeries", () => {
  it("returns null for an empty series", () => {
    expect(summarizeSeries([])).toBeNull()
  })

  it("reports latest, change since start and rate", () => {
    const summary = summarizeSeries([bw(90, 28), bw(86, 0)])
    expect(summary).not.toBeNull()
    expect(summary!.latest).toBe(86)
    expect(summary!.changeSinceStart).toBe(-4)
    expect(summary!.count).toBe(2)
    expect(summary!.ratePerWeek).toBeCloseTo(-1, 5)
  })

  it("sorts an out-of-order series before summarising", () => {
    const summary = summarizeSeries([bw(86, 0), bw(90, 28)])
    expect(summary!.latest).toBe(86)
    expect(summary!.changeSinceStart).toBe(-4)
  })
})

describe("trendDir", () => {
  it("treats null and within-epsilon deltas as flat", () => {
    expect(trendDir(null)).toBe("flat")
    expect(trendDir(0.03, 0.05)).toBe("flat")
  })

  it("classifies sign outside the dead-band", () => {
    expect(trendDir(-0.5, 0.05)).toBe("down")
    expect(trendDir(0.5, 0.05)).toBe("up")
  })
})
