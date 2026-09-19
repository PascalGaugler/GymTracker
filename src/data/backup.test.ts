import { beforeEach, describe, expect, it } from "vitest"
import { installMemoryStorage } from "../test/memoryStorage"
import { resetDb } from "../test/resetDb"
import { exportBackup, exportBackupJson, importBackup, importBackupJson } from "./backup"
import { db } from "./db"
import { measurementRepository } from "./repositories"
import { seedIfEmpty } from "./seed"
import { DEFAULT_SETTINGS, getSettings, reloadSettings, updateSettings } from "./settings"

const storage = installMemoryStorage()

beforeEach(async () => {
  await resetDb()
  storage.clear()
  reloadSettings()
})

describe("backup", () => {
  it("round-trips all data through JSON with dates intact", async () => {
    await seedIfEmpty()
    const measurement = await measurementRepository.add({
      type: "bodyweight",
      value: 83.4,
      unit: "kg",
      measuredAt: new Date("2026-05-08T07:00:00"),
      source: "manual",
    })
    const exerciseCount = await db.exercises.count()
    const workoutCount = await db.workouts.count()

    const json = await exportBackupJson()
    await resetDb()
    expect(await db.exercises.count()).toBe(0)

    await importBackupJson(json)

    expect(await db.exercises.count()).toBe(exerciseCount)
    expect(await db.workouts.count()).toBe(workoutCount)
    const restored = await db.measurements.get(measurement.id)
    expect(restored?.measuredAt).toBeInstanceOf(Date)
    expect(restored?.measuredAt.getTime()).toBe(measurement.measuredAt.getTime())
  })

  it("replaces existing data rather than merging", async () => {
    await seedIfEmpty()
    const snapshot = await exportBackupJson()

    await measurementRepository.add({
      type: "waist",
      value: 84,
      unit: "cm",
      measuredAt: new Date(),
      source: "manual",
    })
    expect(await db.measurements.count()).toBe(1)

    await importBackupJson(snapshot)
    expect(await db.measurements.count()).toBe(0)
  })

  it("carries preferences and restores them on import", async () => {
    await seedIfEmpty()
    updateSettings({ defaultWeightUnit: "lb", calorieIncompleteThreshold: 900 })

    const json = await exportBackupJson()
    updateSettings({ defaultWeightUnit: "kg", calorieIncompleteThreshold: 1500 })
    await importBackupJson(json)

    expect(getSettings()).toEqual({
      defaultWeightUnit: "lb",
      calorieIncompleteThreshold: 900,
    })
  })

  it("imports a file without a settings block, leaving preferences alone", async () => {
    await seedIfEmpty()
    const payload: Record<string, unknown> = { ...(await exportBackup()) }
    delete payload.settings
    updateSettings({ calorieIncompleteThreshold: 1100 })

    await importBackup(JSON.parse(JSON.stringify(payload)))

    expect(getSettings().calorieIncompleteThreshold).toBe(1100)
    expect(getSettings().defaultWeightUnit).toBe(DEFAULT_SETTINGS.defaultWeightUnit)
  })

  it("rejects an invalid payload before touching the database", async () => {
    await seedIfEmpty()
    await expect(importBackup({ version: 1, nope: true })).rejects.toThrow()
    // DB untouched by the failed import.
    expect(await db.trainingPlans.count()).toBe(1)
  })
})
