import { useLiveQuery } from "dexie-react-hooks"

import { sessionRepository } from "@/data/repositories"

// Number of sessions logged under this workout — drives the delete warning.
// Sessions are self-contained and survive the deletion; what breaks is the soft
// link that feeds rotation, placeholders and the per-workout progression view.
// `undefined` while loading.
export function useWorkoutUsage(workoutId: string | undefined): number | undefined {
  return useLiveQuery(
    () => (workoutId ? sessionRepository.countSessionsForWorkout(workoutId) : 0),
    [workoutId],
  )
}
