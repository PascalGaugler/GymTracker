import { useLiveQuery } from "dexie-react-hooks"

import { sessionRepository, workoutRepository } from "@/data/repositories"
import { dayKey } from "@/features/day/day"

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
  return useLiveQuery(async () => (await sessionRepository.getById(sessionId)) ?? null, [sessionId])
}

// The most recent session of a workout, used to fill last-weight placeholders.
// With `before`, the latest strictly before that date — editing/backfilling a
// past session shows the session before IT, not a later one.
export function useLastSession(workoutId: string | undefined, before?: Date) {
  return useLiveQuery(
    () =>
      workoutId
        ? sessionRepository.getLastForWorkout(workoutId, before)
        : Promise.resolve(undefined),
    [workoutId, before?.getTime()],
  )
}

// Every session logged on a calendar day — drives the Log tab's "does the
// selected day already have a session" check. `day` is a fresh Date each
// render when it's today, so the query is keyed by its calendar-day string,
// not the Date instance itself.
export function useSessionsOnDay(day: Date) {
  const key = dayKey(day)
  return useLiveQuery(() => sessionRepository.getByDate(day), [key])
}
