import { useLiveQuery } from "dexie-react-hooks"

import { planRepository, workoutRepository } from "@/data/repositories"
import type { TrainingPlan, Workout } from "@/data/schema"

export interface WorkoutDetail {
  workout: Workout
  plan: TrainingPlan
}

// One workout with its plan. `undefined` while loading, `null` when the workout
// is unknown or does not belong to the plan in the URL, so the view can redirect.
export function useWorkoutDetail(
  planId: string | undefined,
  workoutId: string | undefined,
): WorkoutDetail | null | undefined {
  return useLiveQuery(async () => {
    if (!planId || !workoutId) return null
    const workout = await workoutRepository.getById(workoutId)
    if (!workout || workout.planId !== planId) return null
    const plan = await planRepository.getById(planId)
    if (!plan) return null
    return { workout, plan }
  }, [planId, workoutId])
}
