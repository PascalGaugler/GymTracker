import { useLiveQuery } from "dexie-react-hooks"

import { exerciseRepository, sessionRepository } from "@/data/repositories"
import type { Workout } from "@/data/schema"

import {
  buildStrengthProgression,
  type ProgressionData,
} from "../strengthProgression"

// Live per-workout strength progression for the selected workout: that workout's
// sessions (filtered from all sessions) plus the exercise catalog for names/units,
// built into top-set series. Refreshes the instant a session is saved. Returns
// undefined while loading or when no workout is selected.
export function useWorkoutProgression(
  workout: Workout | undefined,
): ProgressionData | undefined {
  return useLiveQuery(async () => {
    if (!workout) return undefined
    const [sessions, exercises] = await Promise.all([
      sessionRepository.getAll(),
      exerciseRepository.getAll(),
    ])
    const info = new Map(exercises.map((e) => [e.id, { name: e.name, unit: e.unit }]))
    const slotOrder = [...workout.exercises]
      .sort((a, b) => a.order - b.order)
      .map((e) => e.exerciseId)

    return buildStrengthProgression(
      sessions.filter((s) => s.workoutId === workout.id),
      slotOrder,
      (id) => info.get(id) ?? { name: "?", unit: "" },
    )
  }, [workout?.id])
}
