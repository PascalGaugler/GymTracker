import { MeasurementType } from "@/data/schema"
import type { Measurement } from "@/data/schema"

export interface MeasurementChangePlan {
  add: { type: MeasurementType; value: number }[]
  save: { existing: Measurement; value: number }[]
  remove: string[]
}

// Per type: existing + different value → save (replace in place, no duplicate per day); value without entry → add;
// prefilled entry cleared → remove; anything else → skip, so identical values are never rewritten.
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
