import { beforeEach, describe, expect, it } from "vitest"

import { sessionRepository } from "@/data/repositories"
import type { Workout, WorkoutSession } from "@/data/schema"
import { resetDb } from "@/test/resetDb"

import { resolveNextWorkoutId } from "./useWorkoutRotation"

function makeWorkout(id: string, order: number): Workout {
  return { id, planId: "plan", name: id, order, exercises: [] }
}

describe("resolveNextWorkoutId", () => {
  const workouts = [makeWorkout("push", 0), makeWorkout("pull", 1), makeWorkout("legs", 2)]

  it("suggests the first workout when nothing has been logged yet", () => {
    expect(resolveNextWorkoutId(workouts, undefined)).toBe("push")
  })

  it("suggests the one after the last logged workout", () => {
    expect(resolveNextWorkoutId(workouts, "push")).toBe("pull")
  })

  it("wraps around after the last workout in the sequence", () => {
    expect(resolveNextWorkoutId(workouts, "legs")).toBe("push")
  })

  it("falls back to the first workout when the last one isn't in this sequence", () => {
    expect(resolveNextWorkoutId(workouts, "archived-workout")).toBe("push")
  })

  it("returns undefined when there are no workouts", () => {
    expect(resolveNextWorkoutId([], "push")).toBeUndefined()
  })
})

describe("rotation with a `before` boundary (backfill)", () => {
  beforeEach(resetDb)

  const pushId = crypto.randomUUID()
  const pullId = crypto.randomUUID()
  const legsId = crypto.randomUUID()
  const workouts = [makeWorkout(pushId, 0), makeWorkout(pullId, 1), makeWorkout(legsId, 2)]

  function makeSession(workoutId: string, date: Date): WorkoutSession {
    return { id: crypto.randomUUID(), workoutId, date, sets: [] }
  }

  it("is computed from the session strictly before the backfilled day", async () => {
    await sessionRepository.save(makeSession(pushId, new Date("2026-05-01T10:00:00")))

    const before = new Date("2026-05-08T00:00:00")
    const last = await sessionRepository.getLastBefore(before)

    expect(resolveNextWorkoutId(workouts, last?.workoutId)).toBe(pullId)
  })

  it("ignores a session logged on or after the backfilled day", async () => {
    await sessionRepository.save(makeSession(pushId, new Date("2026-05-01T10:00:00")))
    // Logged on the backfilled day itself — must not shift the suggestion.
    await sessionRepository.save(makeSession(pullId, new Date("2026-05-08T10:00:00")))

    const before = new Date("2026-05-08T00:00:00")
    const last = await sessionRepository.getLastBefore(before)

    expect(resolveNextWorkoutId(workouts, last?.workoutId)).toBe(pullId)
  })
})
