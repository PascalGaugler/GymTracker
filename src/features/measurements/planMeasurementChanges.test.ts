import { describe, expect, it } from "vitest"

import type { Measurement } from "@/data/schema"

import { planMeasurementChanges } from "./planMeasurementChanges"

function measurement(type: Measurement["type"], value: number): Measurement {
  return {
    id: crypto.randomUUID(),
    type,
    value,
    unit: type === "bodyweight" ? "kg" : "cm",
    measuredAt: new Date("2026-05-08"),
    source: "manual",
  }
}

const EMPTY_VALUES: Record<Measurement["type"], number | null> = {
  bodyweight: null,
  waist: null,
  chest: null,
  biceps: null,
}

describe("planMeasurementChanges", () => {
  it("replaces an existing entry when the value changed", () => {
    const existing = measurement("bodyweight", 85)
    const prefill = new Map([["bodyweight" as const, existing]])
    const plan = planMeasurementChanges(prefill, { ...EMPTY_VALUES, bodyweight: 84.5 })
    expect(plan).toEqual({ add: [], save: [{ existing, value: 84.5 }], remove: [] })
  })

  it("adds a new entry when there was none for that type", () => {
    const plan = planMeasurementChanges(new Map(), { ...EMPTY_VALUES, waist: 90 })
    expect(plan).toEqual({ add: [{ type: "waist", value: 90 }], save: [], remove: [] })
  })

  it("removes a prefilled entry that was cleared", () => {
    const existing = measurement("chest", 100)
    const prefill = new Map([["chest" as const, existing]])
    const plan = planMeasurementChanges(prefill, EMPTY_VALUES)
    expect(plan).toEqual({ add: [], save: [], remove: [existing.id] })
  })

  it("skips a type that is unchanged", () => {
    const existing = measurement("biceps", 38)
    const prefill = new Map([["biceps" as const, existing]])
    const plan = planMeasurementChanges(prefill, { ...EMPTY_VALUES, biceps: 38 })
    expect(plan).toEqual({ add: [], save: [], remove: [] })
  })

  it("skips a type with no entry and no value", () => {
    const plan = planMeasurementChanges(new Map(), EMPTY_VALUES)
    expect(plan).toEqual({ add: [], save: [], remove: [] })
  })
})
