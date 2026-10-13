import { useLiveQuery } from "dexie-react-hooks"

import { sessionRepository } from "@/data/repositories"

// `0` when no id is given.
export function useExerciseUsage(exerciseId: string | undefined): number | undefined {
  return useLiveQuery(
    () => (exerciseId ? sessionRepository.countSessionsForExercise(exerciseId) : 0),
    [exerciseId],
  )
}
