import { useLiveQuery } from "dexie-react-hooks"

import { measurementRepository } from "@/data/repositories"
import type { Measurement, MeasurementType } from "@/data/schema"
import { dayKey } from "@/features/day/day"

// The day's measurements, one per type — the latest when legacy data holds
// several entries of the same type on one day. Backs the quick-add prefill.
// Keyed by the calendar day so a fresh `Date` each render (today) doesn't
// retrigger the query.
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
