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

// Dashboard readouts for the two headline measurements (bodyweight + waist),
// as of the selected day — entries logged later are excluded, so backfilling
// a past day shows that day's standing, not today's. Wraps the repository in
// useLiveQuery so the cards refresh the instant the quick-add sheet writes a
// new measurement. Returns undefined while loading; a null summary means
// that type has no data up to `until` yet (card shows its empty state).
// `until` is keyed by its calendar day — a fresh `Date` each render (today)
// must not retrigger the query.
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
