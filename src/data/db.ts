import Dexie, { type EntityTable } from "dexie"
import type { TrainingPlan, Workout, Exercise, WorkoutSession, Measurement } from "./schema"

const db = new Dexie("GymTracker") as Dexie & {
  trainingPlans: EntityTable<TrainingPlan, "id">
  workouts: EntityTable<Workout, "id">
  exercises: EntityTable<Exercise, "id">
  sessions: EntityTable<WorkoutSession, "id">
  measurements: EntityTable<Measurement, "id">
}

// Only keys and queried indexes are listed (Dexie stores whole objects). isActive is not indexed: booleans are invalid IndexedDB keys.
db.version(1).stores({
  trainingPlans: "id",
  workouts: "id, planId, [planId+order]",
  exercises: "id, name, type",
  sessions: "id, date, [workoutId+date]",
  measurements: "id, [type+measuredAt]",
})

export { db }
