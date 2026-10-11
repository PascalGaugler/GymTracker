import { useLiveQuery } from "dexie-react-hooks"

import { sessionRepository } from "@/data/repositories"
import { dayKey } from "@/features/day/day"
import { upTo } from "@/lib/upTo"

import { strengthIndexSeries } from "../recomposition"

export interface StrengthIndexSummary {
  /** Most recent strength-index value (100 = baseline). */
  latest: number
  /** Sessions contributing to the index. */
  count: number
}

// Latest strength-index readout for the dashboard card, as of the selected
// day. Sessions after `until` are excluded before computing the series —
// baselines stay FIXED regardless (they're always each exercise's earliest
// sessions, which never move later than `until`). Returns undefined while
// loading; null once loaded but no exercise has an indexable baseline yet.
// `until` is keyed by its calendar day — a fresh `Date` each render (today)
// must not retrigger the query.
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
