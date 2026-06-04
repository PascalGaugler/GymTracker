import { useLiveQuery } from "dexie-react-hooks"

import { exerciseRepository } from "@/data/repositories"
import type { Exercise } from "@/data/schema"

// The catalog keyed by id, so slots and logged sets (which reference an exercise
// by id) can resolve to a display name. Returns undefined while loading.
export function useExerciseCatalog(): Map<string, Exercise> | undefined {
  return useLiveQuery(async () => {
    const all = await exerciseRepository.getAll()
    return new Map(all.map((e) => [e.id, e]))
  }, [])
}
