import { useLiveQuery } from "dexie-react-hooks"

import { sessionRepository } from "@/data/repositories"
import { dayKey } from "@/features/day/day"
import { upTo } from "@/lib/upTo"

import { strengthIndexSeries } from "../recomposition"

export interface StrengthIndexSummary {
  /** Most recent strength-index value (100 = baseline). */
  latest: number
  count: number
}

// As of `until`: later sessions are excluded; baselines stay FIXED regardless (earliest sessions never
// move past `until`). null = no exercise has a baseline yet. `until` is keyed by calendar day so a fresh
// `Date` each render doesn't retrigger the query.
export function useStrengthIndex(until: Date): StrengthIndexSummary | null | undefined {
  const untilKey = dayKey(until)
  return useLiveQuery(async () => {
    const sessions = await sessionRepository.getAll()
    const sessionsUpTo = upTo(sessions, (s) => s.date, until)
    const series = strengthIndexSeries(sessionsUpTo)
    if (series.length === 0) return null
    return { latest: series[series.length - 1].value, count: series.length }
  }, [untilKey])
}
