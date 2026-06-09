import { useLiveQuery } from "dexie-react-hooks"

import { sessionRepository } from "@/data/repositories"

// Number of logged sessions referencing this exercise — drives the delete
// warning so historical data is never removed by accident. `undefined` while
// loading; `0` when no id is given.
export function useExerciseUsage(exerciseId: string | undefined): number | undefined {
  return useLiveQuery(
    () => (exerciseId ? sessionRepository.countSessionsForExercise(exerciseId) : 0),
    [exerciseId],
  )
}
