import { useLiveQuery } from "dexie-react-hooks"

import { sessionRepository } from "@/data/repositories"

import { dayKey } from "../day"

// A zero-set session (abandoned draft) doesn't count as trained.
export function useTrainingDays() {
  return useLiveQuery(async () => {
    const sessions = await sessionRepository.getAll()
    return new Set(sessions.filter((s) => s.sets.length > 0).map((s) => dayKey(s.date)))
  }, [])
}
