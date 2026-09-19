import { z } from "zod"

import { WeightUnit } from "./schema"

// User preferences. Deliberately NOT a Dexie store: it is a single tiny record
// with no queries, no history and no relations, so localStorage + Zod is the
// boring fit (no schema version bump, no migration). It still lives in src/data
// because it is persistence — features reach it through a hook, never directly.

export const SettingsSchema = z.object({
  /** Preselected unit when creating a catalog exercise. Stored weights are never converted. */
  defaultWeightUnit: WeightUnit.default("kg"),
  /**
   * kcal floor below which a tracked day reads as "likely incomplete" and drops
   * out of averages by default. Stored now, consumed by the Phase 2 calorie work.
   */
  calorieIncompleteThreshold: z.number().int().min(0).max(10000).default(1200),
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
    // Quota or privacy mode — keep the in-memory value and move on.
  }
}

let cache: Settings | undefined
const listeners = new Set<() => void>()

/** Current preferences. The returned object is stable until something changes. */
export function getSettings(): Settings {
  cache ??= read()
  return cache
}

/** Merges a patch, validates, persists and notifies subscribers. */
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
