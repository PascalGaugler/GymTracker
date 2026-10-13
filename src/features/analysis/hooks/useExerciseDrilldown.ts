import { useLiveQuery } from "dexie-react-hooks"

import { exerciseRepository, sessionRepository } from "@/data/repositories"

import { buildExerciseDrilldown, type DrilldownData } from "../exerciseDrilldown"

export interface ExerciseDrilldown {
  data: DrilldownData
  name: string
  unit: string
}

// undefined while loading; null once loaded if the exercise id is unknown.
export function useExerciseDrilldown(exerciseId: string): ExerciseDrilldown | null | undefined {
  return useLiveQuery(async () => {
    const [history, exercise] = await Promise.all([
      sessionRepository.getExerciseHistory(exerciseId),
      exerciseRepository.getById(exerciseId),
    ])
    if (!exercise) return null
    return { data: buildExerciseDrilldown(history), name: exercise.name, unit: exercise.unit }
  }, [exerciseId])
}
