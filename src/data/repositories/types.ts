import type {
  Exercise,
  Measurement,
  MeasurementType,
  TrainingPlan,
  Workout,
  WorkoutSession,
} from "../schema"

// A single logged set flattened to a chart-ready point. Aggregation (top set,
// indexing) is presentation logic and lives in the analysis feature, not here.
export interface ExerciseDataPoint {
  date: Date
  weight: number
  setNumber: number
  sessionId: string
}

export interface ExerciseRepository {
  getAll(): Promise<Exercise[]>
  getById(id: string): Promise<Exercise | undefined>
  search(query: string): Promise<Exercise[]>
  save(exercise: Exercise): Promise<void>
  remove(id: string): Promise<void>
}

export interface PlanRepository {
  getAll(): Promise<TrainingPlan[]>
  getById(id: string): Promise<TrainingPlan | undefined>
  getActive(): Promise<TrainingPlan | undefined>
  save(plan: TrainingPlan): Promise<void>
  setActive(id: string): Promise<void>
  /** Deletes the plan and its workouts — workouts have no life outside a plan. */
  remove(id: string): Promise<void>
}

export interface WorkoutRepository {
  getByPlan(planId: string): Promise<Workout[]>
  getById(id: string): Promise<Workout | undefined>
  save(workout: Workout): Promise<void>
  remove(id: string): Promise<void>
}

export interface SessionRepository {
  getById(id: string): Promise<WorkoutSession | undefined>
  /** Every session, ascending by date — the source for cross-exercise analysis. */
  getAll(): Promise<WorkoutSession[]>
  getByDate(date: Date): Promise<WorkoutSession[]>
  getRecent(limit: number): Promise<WorkoutSession[]>
  /**
   * The most recent session of a workout. Without `before`, the latest overall
   * (unchanged behaviour). With `before`, the latest strictly before that date —
   * drives placeholders/rotation when backfilling a past day.
   */
  getLastForWorkout(workoutId: string, before?: Date): Promise<WorkoutSession | undefined>
  /** The most recent session overall, strictly before `date` — rotation for a past day. */
  getLastBefore(date: Date): Promise<WorkoutSession | undefined>
  getExerciseHistory(exerciseId: string): Promise<ExerciseDataPoint[]>
  /** How many sessions contain at least one logged set for this exercise. */
  countSessionsForExercise(exerciseId: string): Promise<number>
  /** How many sessions were logged under this workout. */
  countSessionsForWorkout(workoutId: string): Promise<number>
  save(session: WorkoutSession): Promise<void>
}

export interface MeasurementRepository {
  getByType(type: MeasurementType): Promise<Measurement[]>
  getLatest(type: MeasurementType): Promise<Measurement | undefined>
  /** Every measurement (any type) recorded on that calendar day. */
  getByDate(date: Date): Promise<Measurement[]>
  add(input: Omit<Measurement, "id">): Promise<Measurement>
  /** Validates, then replaces by id (backfill edits an existing entry in place). */
  save(measurement: Measurement): Promise<void>
  remove(id: string): Promise<void>
}
