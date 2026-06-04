import { useLiveQuery } from "dexie-react-hooks"

import {
  planRepository,
  sessionRepository,
  workoutRepository,
} from "@/data/repositories"
import type { Workout } from "@/data/schema"

export interface WorkoutRotation {
  /** The active plan's workouts, pre-sorted by rotation order. */
  workouts: Workout[]
  /** The workout suggested next, derived from the most recent session. */
  nextWorkoutId: string | undefined
}

// Today's suggested workout: the one after the most recently logged workout in
// the active plan's order, wrapping around. With no sessions yet, the first
// workout is suggested. Returns undefined while loading; an empty `workouts`
// array signals no active plan / no workouts (empty state).
export function useWorkoutRotation(): WorkoutRotation | undefined {
  return useLiveQuery(async () => {
    const plan = await planRepository.getActive()
    if (!plan) return { workouts: [], nextWorkoutId: undefined }

    const workouts = await workoutRepository.getByPlan(plan.id)
    if (workouts.length === 0) return { workouts, nextWorkoutId: undefined }

    const [last] = await sessionRepository.getRecent(1)
    const lastIndex = last ? workouts.findIndex((w) => w.id === last.workoutId) : -1
    const nextIndex = lastIndex >= 0 ? (lastIndex + 1) % workouts.length : 0

    return { workouts, nextWorkoutId: workouts[nextIndex].id }
  }, [])
}
