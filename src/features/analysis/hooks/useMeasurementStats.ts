import { useLiveQuery } from "dexie-react-hooks"

import { measurementRepository } from "@/data/repositories"
import { useSettings } from "@/features/settings/hooks/useSettings"

import { goalProgress, type GoalProgress } from "../goal"
import { summarizeSeries, type MeasurementSummary } from "../stats"

export interface DashboardMeasurementStats {
  bodyweight: MeasurementSummary | null
  waist: MeasurementSummary | null
  /** Progress toward the stored target weight; null when the goal bar is hidden. */
  bodyweightGoal: GoalProgress | null
}

// Dashboard readouts for the two headline measurements (bodyweight + waist).
// Wraps the repository in useLiveQuery so the cards refresh the instant the
// quick-add sheet writes a new measurement. Returns undefined while loading;
// a null summary means that type has no data yet (card shows its empty state).
export function useMeasurementStats(): DashboardMeasurementStats | undefined {
  const { targetWeight } = useSettings()
  return useLiveQuery(async () => {
    const [bodyweight, waist] = await Promise.all([
      measurementRepository.getByType("bodyweight"),
      measurementRepository.getByType("waist"),
    ])
    return {
      bodyweight: summarizeSeries(bodyweight),
      waist: summarizeSeries(waist),
      bodyweightGoal: goalProgress(bodyweight, targetWeight),
    }
  }, [targetWeight])
}
