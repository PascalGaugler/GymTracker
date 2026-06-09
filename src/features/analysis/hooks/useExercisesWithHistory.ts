import { useLiveQuery } from "dexie-react-hooks"

import { exerciseRepository, sessionRepository } from "@/data/repositories"

/** An exercise that has at least one logged set — an option for the drilldown picker. */
export interface ExerciseOption {
  id: string
  name: string
  unit: string
}

// Exercises that appear in any logged session, for the drilldown picker. Sorted
// by name (user data, shown verbatim). Returns undefined while loading; an empty
// array means nothing has been logged yet.
export function useExercisesWithHistory(): ExerciseOption[] | undefined {
  return useLiveQuery(async () => {
    const [sessions, exercises] = await Promise.all([
      sessionRepository.getAll(),
      exerciseRepository.getAll(),
    ])
    const byId = new Map(exercises.map((e) => [e.id, e]))
    const ids = new Set<string>()
    for (const s of sessions) for (const set of s.sets) ids.add(set.exerciseId)

    return [...ids]
      .map((id) => byId.get(id))
      .filter((e): e is NonNullable<typeof e> => e != null)
      .map((e) => ({ id: e.id, name: e.name, unit: e.unit }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [])
}
