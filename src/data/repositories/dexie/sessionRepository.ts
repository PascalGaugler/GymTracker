import Dexie from "dexie"
import { startOfDay, endOfDay } from "date-fns"
import { db } from "../../db"
import { WorkoutSessionSchema } from "../../schema"
import type { ExerciseDataPoint, SessionRepository } from "../types"

export const sessionRepository: SessionRepository = {
  getById: (id) => db.sessions.get(id),

  getByDate: (date) =>
    db.sessions.where("date").between(startOfDay(date), endOfDay(date), true, true).toArray(),

  getRecent: (limit) => db.sessions.orderBy("date").reverse().limit(limit).toArray(),

  // Compound index gives the most recent session of a workout (placeholders + rotation).
  getLastForWorkout: (workoutId) =>
    db.sessions
      .where("[workoutId+date]")
      .between([workoutId, Dexie.minKey], [workoutId, Dexie.maxKey])
      .last(),

  async getExerciseHistory(exerciseId) {
    // Sets are embedded; at a few hundred sessions, load + flatten in memory.
    const sessions = await db.sessions.orderBy("date").toArray()
    return sessions.flatMap((s) =>
      s.sets
        .filter((set) => set.exerciseId === exerciseId)
        .map(
          (set): ExerciseDataPoint => ({
            date: s.date,
            weight: set.weight,
            setNumber: set.setNumber,
            sessionId: s.id,
          }),
        ),
    )
  },

  async save(session) {
    await db.sessions.put(WorkoutSessionSchema.parse(session)) // validate on write
  },
}
