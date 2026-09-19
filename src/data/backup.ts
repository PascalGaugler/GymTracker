import { z } from "zod"
import { db } from "./db"
import { getSettings, SettingsSchema, updateSettings } from "./settings"
import {
  ExerciseSchema,
  MeasurementSchema,
  TrainingPlanSchema,
  WorkoutSchema,
  WorkoutSessionSchema,
} from "./schema"

// Export/import is the only backup mechanism (local-first, no backend). A whole
// snapshot is validated with Zod before anything is written; import replaces the
// current contents (single-device app — merge only matters with multiple sources).
// z.coerce.date() lets dates round-trip through JSON with no manual rehydration.

export const BACKUP_VERSION = 1

export const BackupSchema = z.object({
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.coerce.date(),
  trainingPlans: z.array(TrainingPlanSchema),
  workouts: z.array(WorkoutSchema),
  exercises: z.array(ExerciseSchema),
  sessions: z.array(WorkoutSessionSchema),
  measurements: z.array(MeasurementSchema),
  // Optional so files written before preferences existed still import cleanly;
  // an absent block simply leaves the current preferences alone.
  settings: SettingsSchema.optional(),
})
export type Backup = z.infer<typeof BackupSchema>

export async function exportBackup(): Promise<Backup> {
  const [trainingPlans, workouts, exercises, sessions, measurements] = await Promise.all([
    db.trainingPlans.toArray(),
    db.workouts.toArray(),
    db.exercises.toArray(),
    db.sessions.toArray(),
    db.measurements.toArray(),
  ])
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date(),
    trainingPlans,
    workouts,
    exercises,
    sessions,
    measurements,
    settings: getSettings(),
  }
}

export async function exportBackupJson(): Promise<string> {
  return JSON.stringify(await exportBackup(), null, 2)
}

/** Validates the entire payload first, then replaces all stored data atomically. */
export async function importBackup(data: unknown): Promise<void> {
  const backup = BackupSchema.parse(data)
  await db.transaction(
    "rw",
    [db.trainingPlans, db.workouts, db.exercises, db.sessions, db.measurements],
    async () => {
      await Promise.all([
        db.trainingPlans.clear(),
        db.workouts.clear(),
        db.exercises.clear(),
        db.sessions.clear(),
        db.measurements.clear(),
      ])
      await Promise.all([
        db.trainingPlans.bulkPut(backup.trainingPlans),
        db.workouts.bulkPut(backup.workouts),
        db.exercises.bulkPut(backup.exercises),
        db.sessions.bulkPut(backup.sessions),
        db.measurements.bulkPut(backup.measurements),
      ])
    },
  )
  // Preferences live outside IndexedDB, so they are restored after the data
  // transaction commits — a failed import never touches them.
  if (backup.settings) updateSettings(backup.settings)
}

export async function importBackupJson(json: string): Promise<void> {
  await importBackup(JSON.parse(json))
}
