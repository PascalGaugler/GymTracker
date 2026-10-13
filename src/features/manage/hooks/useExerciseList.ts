import { useLiveQuery } from "dexie-react-hooks"

import { exerciseRepository } from "@/data/repositories"
import type { Exercise } from "@/data/schema"

export function useExerciseList(query: string): Exercise[] | undefined {
  return useLiveQuery(() => exerciseRepository.search(query), [query])
}
