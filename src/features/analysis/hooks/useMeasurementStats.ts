import { useLiveQuery } from "dexie-react-hooks"

import { measurementRepository } from "@/data/repositories"

import { summarizeSeries, type MeasurementSummary } from "../stats"

export interface DashboardMeasurementStats {
  bodyweight: MeasurementSummary | null
  waist: MeasurementSummary | null
}

// Dashboard readouts for the two headline measurements (bodyweight + waist).
// Wraps the repository in useLiveQuery so the cards refresh the instant the
// quick-add sheet writes a new measurement. Returns undefined while loading;
// a null summary means that type has no data yet (card shows its empty state).
export function useMeasurementStats(): DashboardMeasurementStats | undefined {
  return useLiveQuery(async () => {
    const [bodyweight, waist] = await Promise.all([
      measurementRepository.getByType("bodyweight"),
      measurementRepository.getByType("waist"),
    ])
    return {
      bodyweight: summarizeSeries(bodyweight),
      waist: summarizeSeries(waist),
    }
  }, [])
}
