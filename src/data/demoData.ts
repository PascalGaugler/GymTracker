import { addDays, startOfDay } from "date-fns"

import { db } from "./db"
import {
  exerciseRepository,
  planRepository,
  workoutRepository,
} from "./repositories"
import {
  MeasurementSchema,
  WorkoutSessionSchema,
  type Exercise,
  type ExerciseType,
  type Measurement,
  type MeasurementType,
  type WorkoutSession,
  type Workout,
} from "./schema"

// Synthetic demo dataset — sessions + body measurements — so the charts and the
// metric maths can be exercised against realistic data before the user has
// logged anything. It is DETERMINISTIC (seeded PRNG): the same workouts/exercises
// always produce the same dataset, so it doubles as a fixture for verifying
// calculations across phases. It is never auto-loaded — only via the dev console
// hooks below (DEV-only). Writes go through the data layer like any other write.

const WEEKS = 16
const SESSION_DAYS = [0, 2, 4] // ~Mon/Wed/Fri within each week
const HOUR_MS = 3_600_000

// Per-type starting top set and double-progression increment (kg). Bodyweight
// lifts carry a small added load so they are indexable (a 0 load can't be).
const START_TOP: Record<ExerciseType, number> = {
  barbell: 60,
  dumbbell: 18,
  machine: 55,
  cable: 22,
  bodyweight: 6,
}
const INCREMENT: Record<ExerciseType, number> = {
  barbell: 2.5,
  dumbbell: 2,
  machine: 5,
  cable: 2.5,
  bodyweight: 1.25,
}

// Small, fast, seedable PRNG (mulberry32) — keeps the dataset reproducible
// without pulling in a dependency.
function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

const round = (n: number, step: number) => Math.round(n / step) * step

interface ExerciseState {
  type: ExerciseType
  top: number // current top set
  inc: number // progression step
  pUp: number // chance the rep target is met (→ load goes up) this session
  seen: boolean
}

export interface DemoOptions {
  /** Anchor for the most-recent end of the dataset (defaults to now). */
  now?: Date
  /** PRNG seed (defaults to a fixed value → reproducible dataset). */
  seed?: number
}

/**
 * Build a reproducible ~16-week PPL history plus body measurements from the
 * active plan's workouts + catalog. Sessions stair-step upward (double
 * progression on the top set); bodyweight and waist trend down while chest and
 * biceps hold — the recomposition thesis, so the charts show something honest.
 */
export function buildDemoDataset(
  workouts: Workout[],
  exercises: Exercise[],
  opts: DemoOptions = {},
): { sessions: WorkoutSession[]; measurements: Measurement[] } {
  const now = opts.now ?? new Date()
  const rand = mulberry32(opts.seed ?? 0xc0ffee)
  const exById = new Map(exercises.map((e) => [e.id, e]))

  const start = startOfDay(addDays(now, -WEEKS * 7))
  const state = new Map<string, ExerciseState>()

  const sessions: WorkoutSession[] = []
  let counter = 0

  for (let week = 0; week < WEEKS; week++) {
    for (const offset of SESSION_DAYS) {
      const workout = workouts[counter % workouts.length]
      counter++
      const date = new Date(addDays(start, week * 7 + offset).getTime() + 18 * HOUR_MS)
      if (date > now) continue

      const sets: WorkoutSession["sets"] = []
      for (const slot of workout.exercises) {
        const exercise = exById.get(slot.exerciseId)
        if (!exercise) continue

        let st = state.get(exercise.id)
        if (!st) {
          // Spread starting loads so exercises aren't identical.
          const base = START_TOP[exercise.type] * (0.85 + rand() * 0.4)
          st = {
            type: exercise.type,
            top: round(base, 0.5),
            inc: INCREMENT[exercise.type],
            pUp: 0.45 + rand() * 0.2,
            seen: false,
          }
          state.set(exercise.id, st)
        }

        // Double progression: once warmed up, bump the load when the rep target
        // is met, otherwise hold — producing realistic stair-stepped lines.
        if (st.seen && rand() < st.pUp) st.top = round(st.top + st.inc, 0.5)
        st.seen = true

        // Build the working sets ramping up to the top set (the heaviest).
        const drop = round(st.inc, 0.5)
        for (let i = 0; i < slot.targetSets; i++) {
          const fromTop = slot.targetSets - 1 - i
          const weight = Math.max(0, round(st.top - fromTop * drop, 0.5))
          sets.push({
            id: crypto.randomUUID(),
            exerciseId: exercise.id,
            setNumber: i + 1,
            weight,
          })
        }
      }

      sessions.push(
        WorkoutSessionSchema.parse({
          id: crypto.randomUUID(),
          workoutId: workout.id,
          date,
          sets,
        }),
      )
    }
  }

  const measurements = buildMeasurements(start, now, rand)
  return { sessions, measurements }
}

function measurement(
  type: MeasurementType,
  value: number,
  unit: Measurement["unit"],
  measuredAt: Date,
): Measurement {
  return MeasurementSchema.parse({
    id: crypto.randomUUID(),
    type,
    value: round(value, 0.1),
    unit,
    measuredAt,
    source: "manual",
  })
}

// Bodyweight (logged ~4×/week, noisy daily) plus circumferences (every ~2 weeks):
// weight + waist fall, chest + biceps roughly hold — fat down, muscle kept.
function buildMeasurements(start: Date, now: Date, rand: () => number): Measurement[] {
  const totalDays = WEEKS * 7
  const out: Measurement[] = []

  for (let day = 0; day <= totalDays; day++) {
    if (rand() >= 0.55) continue
    const at = new Date(addDays(start, day).getTime() + 7 * HOUR_MS)
    if (at > now) continue
    const value = 86 - 0.05 * day + (rand() - 0.5) * 1.2 // ≈ −0.35 kg/week + noise
    out.push(measurement("bodyweight", value, "kg", at))
  }

  for (let day = 0; day <= totalDays; day += 14) {
    const at = new Date(addDays(start, day).getTime() + 7 * HOUR_MS)
    if (at > now) continue
    const week = day / 7
    const noise = () => (rand() - 0.5) * 0.6
    out.push(measurement("waist", 92 - 0.25 * week + noise(), "cm", at))
    out.push(measurement("chest", 104 + 0.05 * week + noise(), "cm", at))
    out.push(measurement("biceps", 38 + 0.04 * week + noise(), "cm", at))
  }

  return out.sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime())
}

/**
 * Generate the demo dataset from the active plan and persist it, REPLACING any
 * existing sessions + measurements (destructive — dev/demo use only). The seed
 * (plan + workouts + exercises) must already exist.
 */
export async function loadDemoData(opts: DemoOptions = {}): Promise<{
  sessions: number
  measurements: number
}> {
  const plan = await planRepository.getActive()
  if (!plan) throw new Error("No active plan — let the first-run seed run before loading demo data.")

  const [workouts, exercises] = await Promise.all([
    workoutRepository.getByPlan(plan.id),
    exerciseRepository.getAll(),
  ])
  if (workouts.length === 0) throw new Error("Active plan has no workouts to log against.")

  const { sessions, measurements } = buildDemoDataset(workouts, exercises, opts)

  await db.transaction("rw", [db.sessions, db.measurements], async () => {
    await db.sessions.clear()
    await db.measurements.clear()
    await db.sessions.bulkPut(sessions)
    await db.measurements.bulkPut(measurements)
  })

  return { sessions: sessions.length, measurements: measurements.length }
}

/** Wipe all sessions + measurements (dev/demo reset). */
export async function clearDemoData(): Promise<void> {
  await db.transaction("rw", [db.sessions, db.measurements], async () => {
    await db.sessions.clear()
    await db.measurements.clear()
  })
}
