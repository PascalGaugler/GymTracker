import { useLiveQuery } from "dexie-react-hooks"

import { sessionRepository, workoutRepository } from "@/data/repositories"

// Reads backing the active-session view. Each wraps a single repository call in
// useLiveQuery, so the view re-renders when its data changes (per data-model.md).

export function useWorkout(workoutId: string | undefined) {
  return useLiveQuery(
    () => (workoutId ? workoutRepository.getById(workoutId) : Promise.resolve(undefined)),
    [workoutId],
  )
}

// undefined = loading · null = not found (a never-saved draft) · session = found.
export function useSession(sessionId: string) {
  return useLiveQuery(
    async () => (await sessionRepository.getById(sessionId)) ?? null,
    [sessionId],
  )
}

// The most recent session of a workout, used to fill last-weight placeholders.
export function useLastSession(workoutId: string | undefined) {
  return useLiveQuery(
    () =>
      workoutId
        ? sessionRepository.getLastForWorkout(workoutId)
        : Promise.resolve(undefined),
    [workoutId],
  )
}
