import { useLiveQuery } from "dexie-react-hooks"

import { exerciseRepository, sessionRepository } from "@/data/repositories"

import { buildExerciseDrilldown, type DrilldownData } from "../exerciseDrilldown"

export interface ExerciseDrilldown {
  data: DrilldownData
  /** The exercise's display name (user data, shown verbatim). */
  name: string
  /** kg / lb, for the chart's value formatting. */
  unit: string
}

// Live drilldown for one exercise: its full top-set + min–max history plus the
// catalog name/unit. Refreshes when a session is saved. Returns undefined while
// loading; null once loaded if the exercise id is unknown.
export function useExerciseDrilldown(
  exerciseId: string,
): ExerciseDrilldown | null | undefined {
  return useLiveQuery(async () => {
    const [history, exercise] = await Promise.all([
      sessionRepository.getExerciseHistory(exerciseId),
      exerciseRepository.getById(exerciseId),
    ])
    if (!exercise) return null
    return { data: buildExerciseDrilldown(history), name: exercise.name, unit: exercise.unit }
  }, [exerciseId])
}
