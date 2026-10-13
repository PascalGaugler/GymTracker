import { useLiveQuery } from "dexie-react-hooks"

import { measurementRepository } from "@/data/repositories"
import { useSettings } from "@/features/settings/hooks/useSettings"
import { dayKey } from "@/features/day/day"
import { upTo } from "@/lib/upTo"

import { goalProgress, type GoalProgress } from "../goal"
import { summarizeSeries, type MeasurementSummary } from "../stats"

export interface DashboardMeasurementStats {
  bodyweight: MeasurementSummary | null
  waist: MeasurementSummary | null
  /** Progress toward the stored target weight; null when the goal bar is hidden. */
  bodyweightGoal: GoalProgress | null
}

// As of `until` (the selected day): later entries are excluded, so backfilling a past day shows that
// day's standing. A null summary = no data up to `until`. `until` is keyed by calendar day so a fresh
// `Date` each render doesn't retrigger the query.
export function useMeasurementStats(until: Date): DashboardMeasurementStats | undefined {
  const { targetWeight } = useSettings()
  const untilKey = dayKey(until)
  return useLiveQuery(async () => {
    const [bodyweight, waist] = await Promise.all([
      measurementRepository.getByType("bodyweight"),
      measurementRepository.getByType("waist"),
    ])
    const bodyweightUpTo = upTo(bodyweight, (m) => m.measuredAt, until)
    const waistUpTo = upTo(waist, (m) => m.measuredAt, until)
    return {
      bodyweight: summarizeSeries(bodyweightUpTo),
      waist: summarizeSeries(waistUpTo),
      bodyweightGoal: goalProgress(bodyweightUpTo, targetWeight),
    }
  }, [targetWeight, untilKey])
}
