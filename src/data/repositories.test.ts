import { beforeEach, describe, expect, it } from "vitest"
import { resetDb } from "../test/resetDb"
import {
  exerciseRepository,
  measurementRepository,
  planRepository,
  sessionRepository,
  workoutRepository,
} from "./repositories"
import type { Exercise, TrainingPlan, Workout, WorkoutSession } from "./schema"

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

  it("cascades to the plan's workouts on remove, leaving other plans alone", async () => {
    const doomed = makePlan()
    const kept = makePlan({ name: "Upper/Lower" })
    await planRepository.save(doomed)
    await planRepository.save(kept)
    await workoutRepository.save({
      id: crypto.randomUUID(),
      planId: doomed.id,
      name: "Push",
      order: 0,
      exercises: [],
    })
    await workoutRepository.save({
      id: crypto.randomUUID(),
      planId: kept.id,
      name: "Upper",
      order: 0,
      exercises: [],
    })

    await planRepository.remove(doomed.id)

    expect(await planRepository.getById(doomed.id)).toBeUndefined()
    expect(await workoutRepository.getByPlan(doomed.id)).toEqual([])
    expect(await workoutRepository.getByPlan(kept.id)).toHaveLength(1)
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

  it("returns every session ascending by date via getAll", async () => {
    await sessionRepository.save(makeSession(new Date("2026-05-08T10:00:00"), 82.5))
    await sessionRepository.save(makeSession(new Date("2026-05-01T10:00:00"), 80))
    const all = await sessionRepository.getAll()
    expect(all.map((s) => s.date.getTime())).toEqual([
      new Date("2026-05-01T10:00:00").getTime(),
      new Date("2026-05-08T10:00:00").getTime(),
    ])
  })

  it("round-trips a session by id", async () => {
    const session = makeSession(new Date("2026-05-01T10:00:00"), 80)
    await sessionRepository.save(session)
    expect(await sessionRepository.getById(session.id)).toEqual(session)
    expect(await sessionRepository.getById(crypto.randomUUID())).toBeUndefined()
  })

  it("flattens embedded sets into exercise history points", async () => {
    await sessionRepository.save(makeSession(new Date("2026-05-01T10:00:00"), 80))
    const history = await sessionRepository.getExerciseHistory(exerciseId)
    expect(history).toHaveLength(2)
    expect(history.map((p) => p.weight).sort((a, b) => a - b)).toEqual([75, 80])
    expect(history[0].date).toBeInstanceOf(Date)
  })

  it("counts sessions referencing an exercise (drives the delete warning)", async () => {
    await sessionRepository.save(makeSession(new Date("2026-05-01T10:00:00"), 80))
    await sessionRepository.save(makeSession(new Date("2026-05-08T10:00:00"), 82.5))
    expect(await sessionRepository.countSessionsForExercise(exerciseId)).toBe(2)
    expect(await sessionRepository.countSessionsForExercise(crypto.randomUUID())).toBe(0)
  })

  it("counts sessions logged under a workout (drives the workout delete warning)", async () => {
    await sessionRepository.save(makeSession(new Date("2026-05-01T10:00:00"), 80))
    await sessionRepository.save(makeSession(new Date("2026-05-08T10:00:00"), 82.5))
    expect(await sessionRepository.countSessionsForWorkout(workoutId)).toBe(2)
    expect(await sessionRepository.countSessionsForWorkout(crypto.randomUUID())).toBe(0)
  })

  describe("getLastForWorkout with a `before` boundary (backfill rotation)", () => {
    it("excludes a session exactly at `before`, includes an earlier same-day one", async () => {
      const exact = makeSession(new Date("2026-05-08T10:00:00"), 82.5)
      const earlierSameDay = makeSession(new Date("2026-05-08T08:00:00"), 81)
      await sessionRepository.save(earlierSameDay)
      await sessionRepository.save(exact)

      const last = await sessionRepository.getLastForWorkout(workoutId, exact.date)
      expect(last?.id).toBe(earlierSameDay.id)
    })

    it("ignores sessions from other workouts", async () => {
      const otherWorkoutId = crypto.randomUUID()
      const other: WorkoutSession = {
        ...makeSession(new Date("2026-05-07T10:00:00"), 60),
        workoutId: otherWorkoutId,
      }
      const mine = makeSession(new Date("2026-05-01T10:00:00"), 80)
      await sessionRepository.save(other)
      await sessionRepository.save(mine)

      const last = await sessionRepository.getLastForWorkout(
        workoutId,
        new Date("2026-05-08T00:00:00"),
      )
      expect(last?.id).toBe(mine.id)
    })

    it("still returns the overall latest when `before` is omitted", async () => {
      const older = makeSession(new Date("2026-05-01T10:00:00"), 80)
      const newer = makeSession(new Date("2026-05-08T10:00:00"), 82.5)
      await sessionRepository.save(older)
      await sessionRepository.save(newer)

      expect((await sessionRepository.getLastForWorkout(workoutId))?.id).toBe(newer.id)
    })

    it("returns undefined when nothing precedes `before`", async () => {
      await sessionRepository.save(makeSession(new Date("2026-05-08T10:00:00"), 82.5))
      const last = await sessionRepository.getLastForWorkout(
        workoutId,
        new Date("2026-05-01T00:00:00"),
      )
      expect(last).toBeUndefined()
    })
  })

  describe("getLastBefore", () => {
    it("returns the latest session strictly before a date, across workouts", async () => {
      const otherWorkoutId = crypto.randomUUID()
      const earlier: WorkoutSession = {
        ...makeSession(new Date("2026-05-01T10:00:00"), 80),
        workoutId: otherWorkoutId,
      }
      const exact = makeSession(new Date("2026-05-08T10:00:00"), 82.5)
      await sessionRepository.save(earlier)
      await sessionRepository.save(exact)

      expect((await sessionRepository.getLastBefore(exact.date))?.id).toBe(earlier.id)
    })

    it("returns undefined with no prior session", async () => {
      await sessionRepository.save(makeSession(new Date("2026-05-08T10:00:00"), 82.5))
      expect(await sessionRepository.getLastBefore(new Date("2026-05-01T00:00:00"))).toBeUndefined()
    })
  })
})

describe("editing a plan vs. logged sessions", () => {
  it("leaves past sessions untouched when the plan is deleted", async () => {
    const exercise = makeExercise()
    const plan: TrainingPlan = {
      id: crypto.randomUUID(),
      name: "PPL",
      isActive: true,
      createdAt: new Date(),
    }
    const workout: Workout = {
      id: crypto.randomUUID(),
      planId: plan.id,
      name: "Push",
      order: 0,
      exercises: [
        {
          id: crypto.randomUUID(),
          exerciseId: exercise.id,
          targetSets: 3,
          repRange: [6, 8],
          order: 0,
          alternativeIds: [],
        },
      ],
    }
    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      workoutId: workout.id,
      date: new Date("2026-05-01T10:00:00"),
      sets: [{ id: crypto.randomUUID(), exerciseId: exercise.id, setNumber: 1, weight: 80 }],
    }
    await exerciseRepository.save(exercise)
    await planRepository.save(plan)
    await workoutRepository.save(workout)
    await sessionRepository.save(session)

    await workoutRepository.save({ ...workout, exercises: [] })
    await planRepository.remove(plan.id)

    expect(await sessionRepository.getById(session.id)).toEqual(session)
    expect(await sessionRepository.getExerciseHistory(exercise.id)).toHaveLength(1)
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

  describe("getByDate", () => {
    it("includes the start and end of the calendar day, excludes neighbouring days", async () => {
      const day = new Date("2026-05-08T00:00:00")
      const startOfDay = await measurementRepository.add({
        type: "bodyweight",
        value: 83,
        unit: "kg",
        measuredAt: new Date("2026-05-08T00:00:00.000"),
        source: "manual",
      })
      const endOfDay = await measurementRepository.add({
        type: "waist",
        value: 80,
        unit: "cm",
        measuredAt: new Date("2026-05-08T23:59:59.999"),
        source: "manual",
      })
      await measurementRepository.add({
        type: "bodyweight",
        value: 84,
        unit: "kg",
        measuredAt: new Date("2026-05-07T23:59:59.999"),
        source: "manual",
      })
      await measurementRepository.add({
        type: "waist",
        value: 79,
        unit: "cm",
        measuredAt: new Date("2026-05-09T00:00:00.000"),
        source: "manual",
      })

      const onDay = await measurementRepository.getByDate(day)
      expect(onDay.map((m) => m.id).sort()).toEqual([startOfDay.id, endOfDay.id].sort())
    })

    it("returns an empty array when nothing was recorded that day", async () => {
      expect(await measurementRepository.getByDate(new Date("2026-05-08T12:00:00"))).toEqual([])
    })
  })

  describe("save", () => {
    it("replaces an existing measurement by id", async () => {
      const original = await measurementRepository.add({
        type: "bodyweight",
        value: 84,
        unit: "kg",
        measuredAt: new Date("2026-05-08T07:00:00"),
        source: "manual",
      })

      await measurementRepository.save({ ...original, value: 83.2 })

      const [stored] = await measurementRepository.getByType("bodyweight")
      expect(stored.value).toBe(83.2)
      expect(await measurementRepository.getByType("bodyweight")).toHaveLength(1)
    })

    it("validates on write (rejects a non-positive value)", async () => {
      const original = await measurementRepository.add({
        type: "bodyweight",
        value: 84,
        unit: "kg",
        measuredAt: new Date("2026-05-08T07:00:00"),
        source: "manual",
      })
      await expect(measurementRepository.save({ ...original, value: 0 })).rejects.toThrow()
    })
  })

  describe("remove", () => {
    it("deletes a measurement by id", async () => {
      const measurement = await measurementRepository.add({
        type: "bodyweight",
        value: 84,
        unit: "kg",
        measuredAt: new Date("2026-05-08T07:00:00"),
        source: "manual",
      })

      await measurementRepository.remove(measurement.id)

      expect(await measurementRepository.getByType("bodyweight")).toEqual([])
    })
  })
})
