import { beforeEach, describe, expect, it } from "vitest"

import {
  DEFAULT_SETTINGS,
  getSettings,
  reloadSettings,
  subscribeSettings,
  updateSettings,
} from "./settings"
import { installMemoryStorage } from "../test/memoryStorage"

const storage = installMemoryStorage()

beforeEach(() => {
  storage.clear()
  reloadSettings()
})

describe("settings", () => {
  it("falls back to defaults when nothing is stored", () => {
    expect(getSettings()).toEqual(DEFAULT_SETTINGS)
    expect(DEFAULT_SETTINGS.defaultWeightUnit).toBe("kg")
  })

  it("persists an update and reads it back from storage", () => {
    updateSettings({ calorieIncompleteThreshold: 900 })
    reloadSettings()

    expect(getSettings().calorieIncompleteThreshold).toBe(900)
    expect(getSettings().defaultWeightUnit).toBe("kg")
  })

  it("rejects an out-of-range value on write", () => {
    expect(() => updateSettings({ calorieIncompleteThreshold: -5 })).toThrow()
    expect(getSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it("falls back to defaults when the stored payload is corrupt", () => {
    storage.setItem("gym-tracker.settings", "{ not json")
    reloadSettings()
    expect(getSettings()).toEqual(DEFAULT_SETTINGS)

    storage.setItem("gym-tracker.settings", JSON.stringify({ defaultWeightUnit: "stone" }))
    reloadSettings()
    expect(getSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it("notifies subscribers on change", () => {
    let calls = 0
    const unsubscribe = subscribeSettings(() => {
      calls += 1
    })

    updateSettings({ defaultWeightUnit: "lb" })
    expect(calls).toBe(1)

    unsubscribe()
    updateSettings({ defaultWeightUnit: "kg" })
    expect(calls).toBe(1)
  })
})
