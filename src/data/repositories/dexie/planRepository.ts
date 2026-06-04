import { db } from "../../db"
import { TrainingPlanSchema } from "../../schema"
import type { PlanRepository } from "../types"

export const planRepository: PlanRepository = {
  getAll: () => db.trainingPlans.toArray(),

  getById: (id) => db.trainingPlans.get(id),

  // isActive is not indexed (booleans are invalid IndexedDB keys); filter in memory.
  async getActive() {
    const plans = await db.trainingPlans.toArray()
    return plans.find((p) => p.isActive)
  },

  async save(plan) {
    await db.trainingPlans.put(TrainingPlanSchema.parse(plan)) // validate on write
  },

  // Exactly one plan is active: flip the target on, the rest off, atomically.
  async setActive(id) {
    await db.transaction("rw", db.trainingPlans, async () => {
      const plans = await db.trainingPlans.toArray()
      await Promise.all(
        plans.map((p) => db.trainingPlans.update(p.id, { isActive: p.id === id })),
      )
    })
  },

  async remove(id) {
    await db.trainingPlans.delete(id)
  },
}
