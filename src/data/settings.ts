import { z } from "zod"

import { WeightUnit } from "./schema"

// Not a Dexie store: a single tiny record, so localStorage + Zod avoids a schema bump.

export const SettingsSchema = z.object({
  defaultWeightUnit: WeightUnit.default("kg"),
  /** kcal floor below which a tracked day is "likely incomplete" and excluded from averages by default. */
  calorieIncompleteThreshold: z.number().int().min(0).max(10000).default(1200),
  /** Bodyweight goal in kg; absent = no goal. The start weight is derived, never stored. */
  targetWeight: z
    .number()
    .positive()
    .max(500)
    .refine((v) => Number(v.toFixed(2)) === v, "at most 2 decimals")
    .optional(),
})
export type Settings = z.infer<typeof SettingsSchema>

export const DEFAULT_SETTINGS: Settings = SettingsSchema.parse({})

const STORAGE_KEY = "gym-tracker.settings"

// localStorage access throws in some privacy modes; preferences are never worth
// breaking a screen over, so every access degrades to the in-memory value.
function storage(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

function read(): Settings {
  try {
    const raw = storage()?.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    // Unknown/partial keys fall back per-field, so a hand-edited or older
    // payload downgrades to defaults instead of blanking the screen.
    const parsed = SettingsSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function write(settings: Settings): void {
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Quota or privacy mode: keep the in-memory value.
  }
}

let cache: Settings | undefined
const listeners = new Set<() => void>()

/** Current preferences. The returned object is stable until something changes. */
export function getSettings(): Settings {
  cache ??= read()
  return cache
}

export function updateSettings(patch: Partial<Settings>): Settings {
  cache = SettingsSchema.parse({ ...getSettings(), ...patch })
  write(cache)
  for (const listener of listeners) listener()
  return cache
}

export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Drops the in-memory copy so the next read comes from storage (tests, import). */
export function reloadSettings(): void {
  cache = undefined
  for (const listener of listeners) listener()
}
