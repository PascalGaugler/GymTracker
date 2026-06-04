import Dexie from "dexie"
import { db } from "../../db"
import { WorkoutSchema } from "../../schema"
import type { WorkoutRepository } from "../types"

export const workoutRepository: WorkoutRepository = {
  // [planId+order] returns a plan's workouts pre-sorted by order.
  getByPlan: (planId) =>
    db.workouts
      .where("[planId+order]")
      .between([planId, Dexie.minKey], [planId, Dexie.maxKey])
      .toArray(),

  getById: (id) => db.workouts.get(id),

  async save(workout) {
    await db.workouts.put(WorkoutSchema.parse(workout)) // validate on write
  },

  async remove(id) {
    await db.workouts.delete(id)
  },
}
