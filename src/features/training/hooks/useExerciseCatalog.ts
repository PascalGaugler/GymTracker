import { useLiveQuery } from "dexie-react-hooks"

import { exerciseRepository } from "@/data/repositories"
import type { Exercise } from "@/data/schema"

export function useExerciseCatalog(): Map<string, Exercise> | undefined {
  return useLiveQuery(async () => {
    const all = await exerciseRepository.getAll()
    return new Map(all.map((e) => [e.id, e]))
  }, [])
}
