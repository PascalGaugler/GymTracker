import { beforeEach, describe, expect, it } from "vitest"
import { resetDb } from "../test/resetDb"
import { exportBackupJson, importBackup, importBackupJson } from "./backup"
import { db } from "./db"
import { measurementRepository } from "./repositories"
import { seedIfEmpty } from "./seed"

beforeEach(resetDb)

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

  it("rejects an invalid payload before touching the database", async () => {
    await seedIfEmpty()
    await expect(importBackup({ version: 1, nope: true })).rejects.toThrow()
    // DB untouched by the failed import.
    expect(await db.trainingPlans.count()).toBe(1)
  })
})
