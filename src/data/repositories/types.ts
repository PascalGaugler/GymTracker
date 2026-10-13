import type {
  Exercise,
  Measurement,
  MeasurementType,
  TrainingPlan,
  Workout,
  WorkoutSession,
} from "../schema"

// Aggregation (top set, indexing) lives in the analysis feature, not here.
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
  getAll(): Promise<WorkoutSession[]>
  getByDate(date: Date): Promise<WorkoutSession[]>
  getRecent(limit: number): Promise<WorkoutSession[]>
  /** Latest session of a workout; with `before`, the latest strictly before that date. */
  getLastForWorkout(workoutId: string, before?: Date): Promise<WorkoutSession | undefined>
  getLastBefore(date: Date): Promise<WorkoutSession | undefined>
  getExerciseHistory(exerciseId: string): Promise<ExerciseDataPoint[]>
  countSessionsForExercise(exerciseId: string): Promise<number>
  countSessionsForWorkout(workoutId: string): Promise<number>
  save(session: WorkoutSession): Promise<void>
}

export interface MeasurementRepository {
  getByType(type: MeasurementType): Promise<Measurement[]>
  getLatest(type: MeasurementType): Promise<Measurement | undefined>
  getByDate(date: Date): Promise<Measurement[]>
  add(input: Omit<Measurement, "id">): Promise<Measurement>
  save(measurement: Measurement): Promise<void>
  remove(id: string): Promise<void>
}
