import { useLiveQuery } from "dexie-react-hooks"

import { planRepository, workoutRepository } from "@/data/repositories"
import type { TrainingPlan } from "@/data/schema"

export interface PlanSummary {
  plan: TrainingPlan
  workoutCount: number
  /** Total target sets across every workout — a rough "size" of the plan. */
  setCount: number
}

// Every plan with a small summary, active first, then newest first.
// `undefined` while the first read is in flight.
export function usePlanList(): PlanSummary[] | undefined {
  return useLiveQuery(async () => {
    const plans = await planRepository.getAll()
    const summaries = await Promise.all(
      plans.map(async (plan): Promise<PlanSummary> => {
        const workouts = await workoutRepository.getByPlan(plan.id)
        return {
          plan,
          workoutCount: workouts.length,
          setCount: workouts.reduce(
            (sum, w) => sum + w.exercises.reduce((s, e) => s + e.targetSets, 0),
            0,
          ),
        }
      }),
    )
    return summaries.sort((a, b) => {
      if (a.plan.isActive !== b.plan.isActive) return a.plan.isActive ? -1 : 1
      return b.plan.createdAt.getTime() - a.plan.createdAt.getTime()
    })
  }, [])
}
