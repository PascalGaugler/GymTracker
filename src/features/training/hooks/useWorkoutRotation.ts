import { useLiveQuery } from "dexie-react-hooks"

import { planRepository, sessionRepository, workoutRepository } from "@/data/repositories"
import type { Workout } from "@/data/schema"

export interface WorkoutRotation {
  /** The active plan's workouts, pre-sorted by rotation order. */
  workouts: Workout[]
  /** The workout suggested next, derived from the most recent session. */
  nextWorkoutId: string | undefined
}

// Pure rotation step: the workout after `lastWorkoutId` in `workouts`'
// (already order-sorted) sequence, wrapping around. No last workout (nothing
// logged yet, or it isn't part of this sequence) suggests the first one.
// Exported and unit-tested on its own — the part of the hook that isn't a
// database read.
export function resolveNextWorkoutId(
  workouts: Workout[],
  lastWorkoutId: string | undefined,
): string | undefined {
  if (workouts.length === 0) return undefined
  const lastIndex = lastWorkoutId ? workouts.findIndex((w) => w.id === lastWorkoutId) : -1
  const nextIndex = lastIndex >= 0 ? (lastIndex + 1) % workouts.length : 0
  return workouts[nextIndex].id
}

// The suggested workout: the one after the most recently logged workout in
// the active plan's order, wrapping around. With no sessions yet, the first
// workout is suggested. Without `before`, "most recent" is the latest session
// overall (today's suggestion). With `before`, it's the latest session
// strictly before that date — the rotation as it stood before a past day,
// for backfilling. Returns undefined while loading; an empty `workouts` array
// signals no active plan / no workouts (empty state).
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
