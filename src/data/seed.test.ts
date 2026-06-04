import { beforeEach, describe, expect, it } from "vitest"
import { resetDb } from "../test/resetDb"
import { db } from "./db"
import { seedIfEmpty } from "./seed"
import { TrainingPlanSchema, WorkoutSchema } from "./schema"

beforeEach(resetDb)

describe("seedIfEmpty", () => {
  it("seeds a valid PPL plan with workouts, slots, and catalog exercises", async () => {
    expect(await seedIfEmpty()).toBe(true)

    const plans = await db.trainingPlans.toArray()
    expect(plans).toHaveLength(1)
    expect(plans[0].isActive).toBe(true)
    expect(() => TrainingPlanSchema.parse(plans[0])).not.toThrow()

    const exercises = await db.exercises.toArray()
    expect(exercises.length).toBeGreaterThan(0)

    const workouts = await db.workouts.toArray()
    expect(workouts.map((w) => w.name).sort()).toEqual(["Legs", "Pull", "Push"])

    const catalogIds = new Set(exercises.map((e) => e.id))
    for (const workout of workouts) {
      expect(() => WorkoutSchema.parse(workout)).not.toThrow()
      expect(workout.planId).toBe(plans[0].id)
      expect(workout.exercises.length).toBeGreaterThan(0)
      // Every slot points at a real catalog exercise (the hub).
      for (const slot of workout.exercises) {
        expect(catalogIds.has(slot.exerciseId)).toBe(true)
      }
    }
  })

  it("does nothing when the database already has data", async () => {
    expect(await seedIfEmpty()).toBe(true)
    const exerciseCount = await db.exercises.count()

    expect(await seedIfEmpty()).toBe(false)
    expect(await db.exercises.count()).toBe(exerciseCount)
    expect(await db.trainingPlans.count()).toBe(1)
  })
})
