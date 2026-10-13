import type { Workout, WorkoutSession } from "@/data/schema"

export interface SessionTally {
  done: number
  /** Planned sets: the target, not what got logged. */
  total: number
}

// Mirrors the active-session form's count (one logged set per set-number, capped at targetSets), from the saved session.
export function sessionTally(session: WorkoutSession, workout: Workout): SessionTally {
  let done = 0
  let total = 0
  for (const slot of workout.exercises) {
    total += slot.targetSets
    const logged = new Set(
      session.sets
        .filter(
          (s) =>
            s.exerciseId === slot.exerciseId && s.setNumber >= 1 && s.setNumber <= slot.targetSets,
        )
        .map((s) => s.setNumber),
    )
    done += logged.size
  }
  return { done, total }
}
