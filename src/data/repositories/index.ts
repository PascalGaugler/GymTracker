// Public surface of the data seam. Nothing outside src/data imports Dexie;
// features import these repository instances (or the interfaces) only.
export type {
  ExerciseDataPoint,
  ExerciseRepository,
  MeasurementRepository,
  PlanRepository,
  SessionRepository,
  WorkoutRepository,
} from "./types"

export { exerciseRepository } from "./dexie/exerciseRepository"
export { planRepository } from "./dexie/planRepository"
export { workoutRepository } from "./dexie/workoutRepository"
export { sessionRepository } from "./dexie/sessionRepository"
export { measurementRepository } from "./dexie/measurementRepository"
