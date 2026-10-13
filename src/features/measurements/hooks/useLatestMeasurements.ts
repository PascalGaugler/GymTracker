import { useLiveQuery } from "dexie-react-hooks"

import { measurementRepository } from "@/data/repositories"
import { MeasurementType, type Measurement } from "@/data/schema"
import { dayKey } from "@/features/day/day"
import { upTo } from "@/lib/upTo"

// Latest value per type up to the end of `until`'s day: on a past day, hints must not show later values.
// Keyed by calendar day so a fresh `Date` each render doesn't retrigger the query.
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
