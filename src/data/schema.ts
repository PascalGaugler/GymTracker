import { z } from "zod"

// --- Enums ---
export const ExerciseType = z.enum(["barbell", "dumbbell", "machine", "cable", "bodyweight"])
export const WeightUnit = z.enum(["kg", "lb"])
export const MeasurementType = z.enum(["bodyweight", "biceps", "chest", "waist"])
export const MeasurementUnit = z.enum(["kg", "cm"])
export const MeasurementSource = z.enum(["manual", "yazio"])

export type ExerciseType = z.infer<typeof ExerciseType>
export type WeightUnit = z.infer<typeof WeightUnit>
export type MeasurementType = z.infer<typeof MeasurementType>
export type MeasurementUnit = z.infer<typeof MeasurementUnit>
export type MeasurementSource = z.infer<typeof MeasurementSource>

// --- Catalog exercise (the hub both plan and logs point at) ---
export const ExerciseSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  type: ExerciseType,
  unit: WeightUnit,
  createdAt: z.coerce.date(),
})
export type Exercise = z.infer<typeof ExerciseSchema>

// --- A slot inside a workout (embedded) ---
export const WorkoutExerciseSchema = z.object({
  id: z.uuid(),
  exerciseId: z.uuid(),
  targetSets: z.number().int().positive(),
  repRange: z.tuple([z.number().int().positive(), z.number().int().positive()]).optional(), // display only
  order: z.number().int().nonnegative(),
  alternativeIds: z.array(z.uuid()).default([]),
})
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>

// --- Workout (belongs to a plan, embeds its slots) ---
export const WorkoutSchema = z.object({
  id: z.uuid(),
  planId: z.uuid(),
  name: z.string().min(1),
  order: z.number().int().nonnegative(),
  exercises: z.array(WorkoutExerciseSchema).default([]),
})
export type Workout = z.infer<typeof WorkoutSchema>

// --- Training plan ---
export const TrainingPlanSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})
export type TrainingPlan = z.infer<typeof TrainingPlanSchema>

// --- A logged set (embedded in a session) ---
export const LoggedSetSchema = z.object({
  id: z.uuid(),
  exerciseId: z.uuid(), // points at the CATALOG exercise — survives plan edits
  setNumber: z.number().int().positive(),
  weight: z.number().nonnegative(),
  variation: z.string().optional(), // free-text, display only
})
export type LoggedSet = z.infer<typeof LoggedSetSchema>

// --- A logged session (embeds its sets; self-contained) ---
export const WorkoutSessionSchema = z.object({
  id: z.uuid(),
  workoutId: z.uuid(), // soft link: drives placeholders + rotation only
  date: z.coerce.date(),
  note: z.string().optional(),
  sets: z.array(LoggedSetSchema).default([]),
})
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>

// --- Measurement: bodyweight + circumferences in one shape ---
export const MeasurementSchema = z.object({
  id: z.uuid(),
  type: MeasurementType,
  value: z.number().positive(),
  unit: MeasurementUnit,
  measuredAt: z.coerce.date(),
  source: MeasurementSource.default("manual"), // future-proofs the Yazio dedup
})
export type Measurement = z.infer<typeof MeasurementSchema>
