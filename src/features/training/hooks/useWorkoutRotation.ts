import { useLiveQuery } from "dexie-react-hooks"

import { planRepository, sessionRepository, workoutRepository } from "@/data/repositories"
import type { Workout } from "@/data/schema"

export interface WorkoutRotation {
  workouts: Workout[]
  nextWorkoutId: string | undefined
}

// No last workout (or one outside the sequence) suggests the first.
export function resolveNextWorkoutId(
  workouts: Workout[],
  lastWorkoutId: string | undefined,
): string | undefined {
  if (workouts.length === 0) return undefined
  const lastIndex = lastWorkoutId ? workouts.findIndex((w) => w.id === lastWorkoutId) : -1
  const nextIndex = lastIndex >= 0 ? (lastIndex + 1) % workouts.length : 0
  return workouts[nextIndex].id
}

// With `before`, the rotation as it stood before a past day (backfill).
// An empty `workouts` array signals no active plan.
export function useWorkoutRotation(before?: Date): WorkoutRotation | undefined {
  return useLiveQuery(async () => {
    const plan = await planRepository.getActive()
    if (!plan) return { workouts: [], nextWorkoutId: undefined }

    const workouts = await workoutRepository.getByPlan(plan.id)
    if (workouts.length === 0) return { workouts, nextWorkoutId: undefined }

    const last = before
      ? await sessionRepository.getLastBefore(before)
      : (await sessionRepository.getRecent(1))[0]

    return { workouts, nextWorkoutId: resolveNextWorkoutId(workouts, last?.workoutId) }
  }, [before?.getTime()])
}
