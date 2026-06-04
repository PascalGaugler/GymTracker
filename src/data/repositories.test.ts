import { beforeEach, describe, expect, it } from "vitest"
import { resetDb } from "../test/resetDb"
import {
  exerciseRepository,
  measurementRepository,
  planRepository,
  sessionRepository,
  workoutRepository,
} from "./repositories"
import type {
  Exercise,
  TrainingPlan,
  Workout,
  WorkoutSession,
} from "./schema"

beforeEach(resetDb)

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: crypto.randomUUID(),
    name: "Bankdrücken",
    type: "barbell",
    unit: "kg",
    createdAt: new Date(),
    ...overrides,
  }
}

describe("exerciseRepository", () => {
  it("round-trips a saved exercise", async () => {
    const exercise = makeExercise()
    await exerciseRepository.save(exercise)
    expect(await exerciseRepository.getById(exercise.id)).toEqual(exercise)
  })

  it("validates on write (rejects an empty name)", async () => {
    await expect(exerciseRepository.save(makeExercise({ name: "" }))).rejects.toThrow()
  })

  it("searches by name, case-insensitively", async () => {
    await exerciseRepository.save(makeExercise({ name: "Klimmzüge" }))
    await exerciseRepository.save(makeExercise({ name: "Bankdrücken" }))
    const hits = await exerciseRepository.search("klimm")
    expect(hits.map((e) => e.name)).toEqual(["Klimmzüge"])
  })
})

describe("planRepository", () => {
  function makePlan(overrides: Partial<TrainingPlan> = {}): TrainingPlan {
    return {
      id: crypto.randomUUID(),
      name: "PPL",
      isActive: false,
      createdAt: new Date(),
      ...overrides,
    }
  }

  it("keeps exactly one plan active via setActive", async () => {
    const a = makePlan({ isActive: true })
    const b = makePlan()
    await planRepository.save(a)
    await planRepository.save(b)

    await planRepository.setActive(b.id)

    const active = await planRepository.getActive()
    expect(active?.id).toBe(b.id)
    expect((await planRepository.getById(a.id))?.isActive).toBe(false)
  })
})

describe("workoutRepository", () => {
  it("returns a plan's workouts pre-sorted by order", async () => {
    const planId = crypto.randomUUID()
    const make = (name: string, order: number): Workout => ({
      id: crypto.randomUUID(),
      planId,
      name,
      order,
      exercises: [],
    })
    await workoutRepository.save(make("Legs", 2))
    await workoutRepository.save(make("Push", 0))
    await workoutRepository.save(make("Pull", 1))

    const workouts = await workoutRepository.getByPlan(planId)
    expect(workouts.map((w) => w.name)).toEqual(["Push", "Pull", "Legs"])
  })
})

describe("sessionRepository", () => {
  const exerciseId = crypto.randomUUID()
  const workoutId = crypto.randomUUID()

  function makeSession(date: Date, topWeight: number): WorkoutSession {
    return {
      id: crypto.randomUUID(),
      workoutId,
      date,
      sets: [
        { id: crypto.randomUUID(), exerciseId, setNumber: 1, weight: topWeight - 5 },
        { id: crypto.randomUUID(), exerciseId, setNumber: 2, weight: topWeight },
      ],
    }
  }

  it("finds sessions by day and the most recent session for a workout", async () => {
    const older = makeSession(new Date("2026-05-01T10:00:00"), 80)
    const newer = makeSession(new Date("2026-05-08T10:00:00"), 82.5)
    await sessionRepository.save(older)
    await sessionRepository.save(newer)

    const onDay = await sessionRepository.getByDate(new Date("2026-05-08T18:00:00"))
    expect(onDay.map((s) => s.id)).toEqual([newer.id])

    const last = await sessionRepository.getLastForWorkout(workoutId)
    expect(last?.id).toBe(newer.id)
  })

  it("flattens embedded sets into exercise history points", async () => {
    await sessionRepository.save(makeSession(new Date("2026-05-01T10:00:00"), 80))
    const history = await sessionRepository.getExerciseHistory(exerciseId)
    expect(history).toHaveLength(2)
    expect(history.map((p) => p.weight).sort((a, b) => a - b)).toEqual([75, 80])
    expect(history[0].date).toBeInstanceOf(Date)
  })
})

describe("measurementRepository", () => {
  it("adds, orders by time, and reads the latest of a type", async () => {
    await measurementRepository.add({
      type: "bodyweight",
      value: 84,
      unit: "kg",
      measuredAt: new Date("2026-05-01T07:00:00"),
      source: "manual",
    })
    const latest = await measurementRepository.add({
      type: "bodyweight",
      value: 83.4,
      unit: "kg",
      measuredAt: new Date("2026-05-08T07:00:00"),
      source: "manual",
    })

    const series = await measurementRepository.getByType("bodyweight")
    expect(series.map((m) => m.value)).toEqual([84, 83.4])
    expect((await measurementRepository.getLatest("bodyweight"))?.id).toBe(latest.id)
  })
})
