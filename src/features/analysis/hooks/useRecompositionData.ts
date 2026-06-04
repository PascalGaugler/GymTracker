import { useLiveQuery } from "dexie-react-hooks"

import { measurementRepository, sessionRepository } from "@/data/repositories"

import { buildRecomposition, type RecompositionData } from "../recomposition"

// Live recomposition dataset for the hero chart: every session (for the strength
// index) plus the bodyweight series, indexed to a shared 100 baseline. Wrapped
// in useLiveQuery so the chart refreshes the instant a session is saved or a
// weigh-in is added. Returns undefined while loading.
export function useRecompositionData(): RecompositionData | undefined {
  return useLiveQuery(async () => {
    const [sessions, bodyweight] = await Promise.all([
      sessionRepository.getAll(),
      measurementRepository.getByType("bodyweight"),
    ])
    return buildRecomposition(sessions, bodyweight)
  }, [])
}
