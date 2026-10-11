import { useLiveQuery } from "dexie-react-hooks"

import { measurementRepository } from "@/data/repositories"
import { MeasurementType, type Measurement } from "@/data/schema"
import { dayKey } from "@/features/day/day"
import { upTo } from "@/lib/upTo"

// The latest value of every measurement type as of `until` (inclusive of that
// whole calendar day), keyed by type. Backs the quick-add placeholders (the
// last-value hint per field) — on a past day the hint must reflect what was
// known up to that day, not values logged later. Keyed by the calendar day so
// a fresh `Date` each render (today) doesn't retrigger the query.
export function useLatestMeasurements(until: Date) {
  const key = dayKey(until)
  return useLiveQuery(async () => {
    const entries = await Promise.all(
      MeasurementType.options.map(async (type) => {
        const series = await measurementRepository.getByType(type)
        const latest = upTo(series, (m) => m.measuredAt, until).at(-1)
        return [type, latest] as const
      }),
    )
    return new Map<MeasurementType, Measurement | undefined>(entries)
  }, [key])
}
