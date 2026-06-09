import { useLiveQuery } from "dexie-react-hooks"

import { exerciseRepository } from "@/data/repositories"
import type { Exercise } from "@/data/schema"

// Live, name-sorted catalog filtered by a free-text query (empty = all).
// `undefined` while the first read is in flight.
export function useExerciseList(query: string): Exercise[] | undefined {
  return useLiveQuery(() => exerciseRepository.search(query), [query])
}
