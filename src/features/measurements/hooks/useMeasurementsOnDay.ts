import { useLiveQuery } from "dexie-react-hooks"

import { measurementRepository } from "@/data/repositories"
import type { Measurement, MeasurementType } from "@/data/schema"
import { dayKey } from "@/features/day/day"

// Latest entry per type when legacy data has several on one day.
// Keyed by calendar day so a fresh `Date` each render doesn't retrigger the query.
export function useMeasurementsOnDay(day: Date) {
  const key = dayKey(day)
  return useLiveQuery(async () => {
    const entries = await measurementRepository.getByDate(day)
    const byType = new Map<MeasurementType, Measurement>()
    for (const m of entries) {
      const current = byType.get(m.type)
      if (!current || m.measuredAt.getTime() > current.measuredAt.getTime()) byType.set(m.type, m)
    }
    return byType
  }, [key])
}
