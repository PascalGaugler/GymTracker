import type { Workout, WorkoutSession } from "@/data/schema"

export interface SessionTally {
  /** Sets with a logged weight, across the workout's slots. */
  done: number
  /** Planned sets across the workout's slots (the target, not what got logged). */
  total: number
}

// "done/total Sätze" for a saved session against its workout's slots — the
// Dashboard workout card's progress tally. Mirrors what the active-session
// form counts (one logged set per set-number, capped at the slot's target),
// but reads it from the SAVED session rather than in-progress form state, so
// it works for a session that's merely being displayed, not edited.
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
