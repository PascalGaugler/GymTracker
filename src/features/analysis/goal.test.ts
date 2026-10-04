import { describe, expect, it } from "vitest"

import type { Measurement } from "@/data/schema"

import { goalProgress } from "./goal"

function bw(value: number, day: number): Measurement {
  return {
    id: crypto.randomUUID(),
    type: "bodyweight",
    value,
    unit: "kg",
    measuredAt: new Date(2026, 0, day),
    source: "manual",
  }
}

describe("goalProgress", () => {
  it("derives start from the first and current from the latest measurement", () => {
    // Deliberately unsorted input.
    const result = goalProgress([bw(85, 10), bw(90, 1), bw(87.5, 5)], 80)
    expect(result).toEqual({ start: 90, target: 80, current: 85, progress: 0.5 })
  })

  it("clamps progress to 0 when the weight went up", () => {
    expect(goalProgress([bw(90, 1), bw(92, 2)], 80)?.progress).toBe(0)
  })

  it("clamps progress to 1 once the target is passed", () => {
    expect(goalProgress([bw(90, 1), bw(78, 2)], 80)?.progress).toBe(1)
  })

  it("is 0 with a single measurement", () => {
    expect(goalProgress([bw(90, 1)], 80)?.progress).toBe(0)
  })

  it("is hidden without a target, without measurements, or when target >= start", () => {
    expect(goalProgress([bw(90, 1)], undefined)).toBeNull()
    expect(goalProgress([], 80)).toBeNull()
    expect(goalProgress([bw(80, 1), bw(79, 2)], 80)).toBeNull()
    expect(goalProgress([bw(80, 1)], 85)).toBeNull()
  })
})
