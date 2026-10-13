import { useLiveQuery } from "dexie-react-hooks"

import { sessionRepository, workoutRepository } from "@/data/repositories"
import { dayKey } from "@/features/day/day"

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

// With `before`: latest strictly before that date, so editing a past session shows the one before it.
export function useLastSession(workoutId: string | undefined, before?: Date) {
  return useLiveQuery(
    () =>
      workoutId
        ? sessionRepository.getLastForWorkout(workoutId, before)
        : Promise.resolve(undefined),
    [workoutId, before?.getTime()],
  )
}

// Keyed by calendar-day string: `day` is a fresh Date each render when it's today.
export function useSessionsOnDay(day: Date) {
  const key = dayKey(day)
  return useLiveQuery(() => sessionRepository.getByDate(day), [key])
}
