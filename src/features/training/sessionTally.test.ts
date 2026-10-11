import { describe, expect, it } from "vitest"

import type { Workout, WorkoutSession } from "@/data/schema"

import { sessionTally } from "./sessionTally"

function makeWorkout(slots: { exerciseId: string; targetSets: number }[]): Workout {
  return {
    id: "w",
    planId: "p",
    name: "Push",
    order: 0,
    exercises: slots.map((s, i) => ({
      id: `slot-${i}`,
      exerciseId: s.exerciseId,
      targetSets: s.targetSets,
      order: i,
      alternativeIds: [],
    })),
  }
}

function makeSession(sets: { exerciseId: string; setNumber: number }[]): WorkoutSession {
  return {
    id: "s",
    workoutId: "w",
    date: new Date("2026-05-08T10:00:00"),
    sets: sets.map((s, i) => ({
      id: `set-${i}`,
      exerciseId: s.exerciseId,
      setNumber: s.setNumber,
      weight: 80,
    })),
  }
}

describe("sessionTally", () => {
  it("counts every planned set as the total, across slots", () => {
    const workout = makeWorkout([
      { exerciseId: "bench", targetSets: 3 },
      { exerciseId: "fly", targetSets: 2 },
    ])
    const session = makeSession([])
    expect(sessionTally(session, workout).total).toBe(5)
  })

  it("reads 18/18 for a fully logged session (DN4 verification case)", () => {
    const workout = makeWorkout([
      { exerciseId: "bench", targetSets: 4 },
      { exerciseId: "fly", targetSets: 4 },
      { exerciseId: "ohp", targetSets: 4 },
      { exerciseId: "lateral", targetSets: 3 },
      { exerciseId: "triceps", targetSets: 3 },
    ])
    const session = makeSession([
      ...[1, 2, 3, 4].map((n) => ({ exerciseId: "bench", setNumber: n })),
      ...[1, 2, 3, 4].map((n) => ({ exerciseId: "fly", setNumber: n })),
      ...[1, 2, 3, 4].map((n) => ({ exerciseId: "ohp", setNumber: n })),
      ...[1, 2, 3].map((n) => ({ exerciseId: "lateral", setNumber: n })),
      ...[1, 2, 3].map((n) => ({ exerciseId: "triceps", setNumber: n })),
    ])
    expect(sessionTally(session, workout)).toEqual({ done: 18, total: 18 })
  })

  it("counts a partially logged session", () => {
    const workout = makeWorkout([{ exerciseId: "bench", targetSets: 3 }])
    const session = makeSession([{ exerciseId: "bench", setNumber: 1 }])
    expect(sessionTally(session, workout)).toEqual({ done: 1, total: 3 })
  })

  it("ignores sets for a different exercise or outside the slot's target range", () => {
    const workout = makeWorkout([{ exerciseId: "bench", targetSets: 2 }])
    const session = makeSession([
      { exerciseId: "bench", setNumber: 1 },
      { exerciseId: "bench", setNumber: 5 }, // beyond targetSets — doesn't count
      { exerciseId: "other-exercise", setNumber: 1 }, // not this slot
    ])
    expect(sessionTally(session, workout)).toEqual({ done: 1, total: 2 })
  })

  it("never double-counts a set-number logged more than once", () => {
    const workout = makeWorkout([{ exerciseId: "bench", targetSets: 2 }])
    const session = makeSession([
      { exerciseId: "bench", setNumber: 1 },
      { exerciseId: "bench", setNumber: 1 },
    ])
    expect(sessionTally(session, workout).done).toBe(1)
  })

  it("returns 0/0 for a workout with no slots", () => {
    expect(sessionTally(makeSession([]), makeWorkout([]))).toEqual({ done: 0, total: 0 })
  })
})
