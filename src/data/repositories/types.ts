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
  getByDate(date: Date): Promise<WorkoutSession[]>
  getRecent(limit: number): Promise<WorkoutSession[]>
  getLastForWorkout(workoutId: string): Promise<WorkoutSession | undefined>
  getExerciseHistory(exerciseId: string): Promise<ExerciseDataPoint[]>
  save(session: WorkoutSession): Promise<void>
}

export interface MeasurementRepository {
  getByType(type: MeasurementType): Promise<Measurement[]>
  getLatest(type: MeasurementType): Promise<Measurement | undefined>
  add(input: Omit<Measurement, "id">): Promise<Measurement>
}
