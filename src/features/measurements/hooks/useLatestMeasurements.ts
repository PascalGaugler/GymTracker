import { useLiveQuery } from "dexie-react-hooks"

import { measurementRepository } from "@/data/repositories"
import { MeasurementType, type Measurement } from "@/data/schema"

// The latest value of every measurement type, keyed by type. Backs the
// quick-add placeholders (last-value hint per field). Wraps the repository in
// useLiveQuery so the map refreshes as soon as a new measurement is written.
export function useLatestMeasurements() {
  return useLiveQuery(async () => {
    const entries = await Promise.all(
      MeasurementType.options.map(
        async (type) => [type, await measurementRepository.getLatest(type)] as const,
      ),
    )
    return new Map<MeasurementType, Measurement | undefined>(entries)
  }, [])
}
