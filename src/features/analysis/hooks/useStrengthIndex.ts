import { useLiveQuery } from "dexie-react-hooks"

import { sessionRepository } from "@/data/repositories"

import { strengthIndexSeries } from "../recomposition"

export interface StrengthIndexSummary {
  /** Most recent strength-index value (100 = baseline). */
  latest: number
  /** Sessions contributing to the index. */
  count: number
}

// Latest strength-index readout for the dashboard card. Computes the per-session
// index series (fixed baseline) and returns its last value. Returns undefined
// while loading; null once loaded but no exercise has an indexable baseline yet.
export function useStrengthIndex(): StrengthIndexSummary | null | undefined {
  return useLiveQuery(async () => {
    const series = strengthIndexSeries(await sessionRepository.getAll())
    if (series.length === 0) return null
    return { latest: series[series.length - 1].value, count: series.length }
  }, [])
}
