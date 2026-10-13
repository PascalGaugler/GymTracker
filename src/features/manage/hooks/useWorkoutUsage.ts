import { useLiveQuery } from "dexie-react-hooks"

import { sessionRepository } from "@/data/repositories"

// Sessions survive deletion; what breaks is the soft link feeding rotation, placeholders and progression.
export function useWorkoutUsage(workoutId: string | undefined): number | undefined {
  return useLiveQuery(
    () => (workoutId ? sessionRepository.countSessionsForWorkout(workoutId) : 0),
    [workoutId],
  )
}
