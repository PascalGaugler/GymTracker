import { beforeEach, describe, expect, it } from "vitest"

import { buildRecomposition } from "@/features/analysis/recomposition"

import { resetDb } from "../test/resetDb"
import { buildDemoDataset, loadDemoData } from "./demoData"
import {
  exerciseRepository,
  measurementRepository,
  planRepository,
  sessionRepository,
  workoutRepository,
} from "./repositories"
import { seedIfEmpty } from "./seed"

const NOW = new Date("2026-06-04T12:00:00")

beforeEach(resetDb)

describe("buildDemoDataset", () => {
  it("is deterministic for a given seed (loads aside from random ids)", async () => {
    await seedIfEmpty()
    const plan = await planRepository.getActive()
    const workouts = await workoutRepository.getByPlan(plan!.id)
    const exercises = await exerciseRepository.getAll()

    const a = buildDemoDataset(workouts, exercises, { now: NOW, seed: 7 })
    const b = buildDemoDataset(workouts, exercises, { now: NOW, seed: 7 })

    const weights = (d: typeof a) => d.sessions.flatMap((s) => s.sets.map((x) => x.weight))
    expect(weights(a)).toEqual(weights(b))
    expect(a.measurements.map((m) => m.value)).toEqual(b.measurements.map((m) => m.value))
  })
})

describe("loadDemoData", () => {
  it("requires the seed to have run", async () => {
    await expect(loadDemoData({ now: NOW })).rejects.toThrow()
  })

  it("persists a dataset whose recomposition shows strength up + bodyweight down", async () => {
    await seedIfEmpty()
    const counts = await loadDemoData({ now: NOW, seed: 1 })
    expect(counts.sessions).toBeGreaterThan(30)
    expect(counts.measurements).toBeGreaterThan(20)

    const [sessions, bodyweight] = await Promise.all([
      sessionRepository.getAll(),
      measurementRepository.getByType("bodyweight"),
    ])
    const recomp = buildRecomposition(sessions, bodyweight)

    expect(recomp.hasStrength).toBe(true)
    expect(recomp.hasBodyweight).toBe(true)

    // Thesis: the strength index ends above the 100 baseline...
    expect(recomp.latestStrengthIndex).not.toBeNull()
    expect(recomp.latestStrengthIndex!).toBeGreaterThan(100)

    // ...while indexed bodyweight ends below it.
    const bwPoints = recomp.points.filter((p) => p.bodyweight != null)
    expect(bwPoints.at(-1)!.bodyweight!).toBeLessThan(100)
  })

  it("replaces existing demo data rather than appending", async () => {
    await seedIfEmpty()
    const first = await loadDemoData({ now: NOW, seed: 1 })
    const second = await loadDemoData({ now: NOW, seed: 1 })
    expect((await sessionRepository.getAll()).length).toBe(second.sessions)
    expect(second.sessions).toBe(first.sessions)
  })
})
