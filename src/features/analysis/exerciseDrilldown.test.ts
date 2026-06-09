import { describe, expect, it } from "vitest"

import type { ExerciseDataPoint } from "@/data/repositories"

import { buildExerciseDrilldown } from "./exerciseDrilldown"

const DAY = 86_400_000
const T0 = new Date("2026-01-01T10:00:00").getTime()

function day(n: number): Date {
  return new Date(T0 + n * DAY)
}

// The flat per-set points the repository returns for one exercise.
function point(sessionId: string, dayN: number, weight: number, setNumber: number): ExerciseDataPoint {
  return { sessionId, date: day(dayN), weight, setNumber }
}

describe("buildExerciseDrilldown", () => {
  it("returns nothing for empty history", () => {
    const data = buildExerciseDrilldown([])
    expect(data.points).toEqual([])
    expect(data.sessionCount).toBe(0)
  })

  it("derives top + min–max band per session, sorted by date", () => {
    const data = buildExerciseDrilldown([
      point("s1", 0, 80, 1),
      point("s1", 0, 75, 2),
      point("s1", 0, 70, 3),
      point("s2", 3, 85, 1),
      point("s2", 3, 82, 2),
    ])
    expect(data.points).toEqual([
      { t: day(0).getTime(), top: 80, min: 70, band: [70, 80] },
      { t: day(3).getTime(), top: 85, min: 82, band: [82, 85] },
    ])
    expect(data.sessionCount).toBe(2)
  })

  it("collapses a single-set session to a zero-height band at the top set", () => {
    const data = buildExerciseDrilldown([point("s1", 0, 100, 1)])
    expect(data.points[0]).toEqual({ t: day(0).getTime(), top: 100, min: 100, band: [100, 100] })
  })

  it("brackets the min and the top set with a padded axis", () => {
    const data = buildExerciseDrilldown([
      point("s1", 0, 100, 1),
      point("s1", 0, 90, 2),
    ])
    expect(data.yDomain[0]).toBeLessThanOrEqual(90)
    expect(data.yDomain[1]).toBeGreaterThanOrEqual(100)
  })
})
