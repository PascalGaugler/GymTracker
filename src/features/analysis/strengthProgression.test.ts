import { describe, expect, it } from "vitest"

import type { WorkoutSession } from "@/data/schema"

import { buildStrengthProgression, PROGRESSION_PALETTE } from "./strengthProgression"

const DAY = 86_400_000
const T0 = new Date("2026-01-01T10:00:00").getTime()

function day(n: number): Date {
  return new Date(T0 + n * DAY)
}

// A session whose listed exercises each log two sets; the heavier is the top set.
function session(
  dayN: number,
  lifts: { exerciseId: string; top: number }[],
): WorkoutSession {
  return {
    id: crypto.randomUUID(),
    workoutId: "w",
    date: day(dayN),
    sets: lifts.flatMap((l, li) => [
      { id: crypto.randomUUID(), exerciseId: l.exerciseId, setNumber: li * 2 + 1, weight: l.top - 5 },
      { id: crypto.randomUUID(), exerciseId: l.exerciseId, setNumber: li * 2 + 2, weight: l.top },
    ]),
  }
}

const info = (id: string) => ({ name: id.toUpperCase(), unit: "kg" })

describe("buildStrengthProgression", () => {
  it("returns nothing for no sessions", () => {
    const data = buildStrengthProgression([], ["A"], info)
    expect(data.series).toEqual([])
    expect(data.rows).toEqual([])
  })

  it("uses the heaviest set of each session as the line value", () => {
    const data = buildStrengthProgression(
      [session(0, [{ exerciseId: "a", top: 80 }]), session(3, [{ exerciseId: "a", top: 85 }])],
      ["a"],
      info,
    )
    expect(data.series).toHaveLength(1)
    expect(data.series[0].points).toEqual([
      { t: day(0).getTime(), top: 80 },
      { t: day(3).getTime(), top: 85 },
    ])
  })

  it("orders series by slot order, then resolves name/unit/colour", () => {
    const data = buildStrengthProgression(
      [session(0, [{ exerciseId: "b", top: 40 }, { exerciseId: "a", top: 100 }])],
      ["a", "b"],
      info,
    )
    expect(data.series.map((s) => s.exerciseId)).toEqual(["a", "b"])
    expect(data.series[0]).toMatchObject({ name: "A", unit: "kg", color: PROGRESSION_PALETTE[0] })
    expect(data.series[1].color).toBe(PROGRESSION_PALETTE[1])
  })

  it("treats a swap as a separate series with no bridging row value", () => {
    // 'a' logged sessions 0,3; swapped for 'c' in sessions 6,9. 'c' is not a
    // current slot, so it sorts after the in-plan exercise.
    const data = buildStrengthProgression(
      [
        session(0, [{ exerciseId: "a", top: 100 }]),
        session(3, [{ exerciseId: "a", top: 105 }]),
        session(6, [{ exerciseId: "c", top: 60 }]),
        session(9, [{ exerciseId: "c", top: 65 }]),
      ],
      ["a"],
      info,
    )
    expect(data.series.map((s) => s.exerciseId)).toEqual(["a", "c"])
    // 'a' has no value on the dates 'c' was logged, and vice versa — so the
    // lines cannot bridge across the swap.
    expect(data.rows.map((r) => r.a)).toEqual([100, 105, null, null])
    expect(data.rows.map((r) => r.c)).toEqual([null, null, 60, 65])
  })

  it("skips unweighted (0 kg) top sets that aren't meaningful to plot", () => {
    const data = buildStrengthProgression(
      [session(0, [{ exerciseId: "a", top: 0 }])],
      ["a"],
      info,
    )
    expect(data.series).toEqual([])
  })

  it("cycles the palette when there are more exercises than colours", () => {
    const lifts = Array.from({ length: 7 }, (_, i) => ({ exerciseId: `e${i}`, top: 50 + i }))
    const data = buildStrengthProgression(
      [session(0, lifts)],
      lifts.map((l) => l.exerciseId),
      info,
    )
    expect(data.series).toHaveLength(7)
    expect(data.series[6].color).toBe(PROGRESSION_PALETTE[0])
  })

  it("brackets the logged weights with a padded axis", () => {
    const data = buildStrengthProgression(
      [session(0, [{ exerciseId: "a", top: 100 }]), session(3, [{ exerciseId: "a", top: 110 }])],
      ["a"],
      info,
    )
    expect(data.yDomain[0]).toBeLessThanOrEqual(100)
    expect(data.yDomain[1]).toBeGreaterThanOrEqual(110)
    expect(data.yTicks.length).toBeGreaterThan(1)
  })
})
