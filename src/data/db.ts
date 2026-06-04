import Dexie, { type EntityTable } from "dexie"
import type { TrainingPlan, Workout, Exercise, WorkoutSession, Measurement } from "./schema"

const db = new Dexie("GymTracker") as Dexie & {
  trainingPlans: EntityTable<TrainingPlan, "id">
  workouts: EntityTable<Workout, "id">
  exercises: EntityTable<Exercise, "id">
  sessions: EntityTable<WorkoutSession, "id">
  measurements: EntityTable<Measurement, "id">
}

// The schema string declares only the primary key and the indexes we query by;
// Dexie persists the whole object regardless, so embedded exercises[]/sets[] are
// stored without being listed. `isActive` is deliberately not indexed (booleans
// are not valid IndexedDB keys) — filter it in memory.
db.version(1).stores({
  trainingPlans: "id",
  workouts: "id, planId, [planId+order]",
  exercises: "id, name, type",
  sessions: "id, date, [workoutId+date]",
  measurements: "id, [type+measuredAt]",
})

export { db }
