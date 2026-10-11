import { MeasurementType } from "@/data/schema"
import type { Measurement } from "@/data/schema"

export interface MeasurementChangePlan {
  add: { type: MeasurementType; value: number }[]
  save: { existing: Measurement; value: number }[]
  remove: string[]
}

// Pure "what to write" diff for the quick-add save: one prefilled entry per
// type for the day, compared against the edited values (null = cleared/empty).
// Per type: existing + a different value → save (replace in place, no
// duplicate per day); a value with no existing entry → add; a prefilled entry
// cleared → remove (by id); anything else (no entry and no value, or an
// unchanged value) → skip, so saving never rewrites an identical value.
export function planMeasurementChanges(
  prefill: Map<MeasurementType, Measurement>,
  values: Record<MeasurementType, number | null>,
): MeasurementChangePlan {
  const plan: MeasurementChangePlan = { add: [], save: [], remove: [] }
  for (const type of MeasurementType.options) {
    const existing = prefill.get(type)
    const value = values[type]
    if (existing && value != null) {
      if (existing.value !== value) plan.save.push({ existing, value })
    } else if (!existing && value != null) {
      plan.add.push({ type, value })
    } else if (existing && value == null) {
      plan.remove.push(existing.id)
    }
  }
  return plan
}
