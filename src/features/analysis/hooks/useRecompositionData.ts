import { useLiveQuery } from "dexie-react-hooks"

import { measurementRepository, sessionRepository } from "@/data/repositories"

import { buildRecomposition, type RecompositionData } from "../recomposition"

export function useRecompositionData(): RecompositionData | undefined {
  return useLiveQuery(async () => {
    const [sessions, bodyweight] = await Promise.all([
      sessionRepository.getAll(),
      measurementRepository.getByType("bodyweight"),
    ])
    return buildRecomposition(sessions, bodyweight)
  }, [])
}
