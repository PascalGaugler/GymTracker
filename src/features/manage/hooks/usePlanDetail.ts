import { useLiveQuery } from "dexie-react-hooks"

import { planRepository, workoutRepository } from "@/data/repositories"
import type { TrainingPlan, Workout } from "@/data/schema"

export interface PlanDetail {
  plan: TrainingPlan
  /** The plan's workouts, pre-sorted by rotation order. */
  workouts: Workout[]
}

// One plan with its workouts. `undefined` while loading, `null` when the id is
// unknown (deleted plan / hand-typed URL) so the view can redirect.
export function usePlanDetail(planId: string | undefined): PlanDetail | null | undefined {
  return useLiveQuery(async () => {
    if (!planId) return null
    const plan = await planRepository.getById(planId)
    if (!plan) return null
    return { plan, workouts: await workoutRepository.getByPlan(planId) }
  }, [planId])
}
