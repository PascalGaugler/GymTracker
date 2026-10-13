import Dexie from "dexie"
import { startOfDay, endOfDay } from "date-fns"
import { db } from "../../db"
import { WorkoutSessionSchema } from "../../schema"
import type { ExerciseDataPoint, SessionRepository } from "../types"

export const sessionRepository: SessionRepository = {
  getById: (id) => db.sessions.get(id),

  getAll: () => db.sessions.orderBy("date").toArray(),

  getByDate: (date) =>
    db.sessions.where("date").between(startOfDay(date), endOfDay(date), true, true).toArray(),

  getRecent: (limit) => db.sessions.orderBy("date").reverse().limit(limit).toArray(),

  // With `before`, the upper bound is exclusive, so backfilling a past day (or editing a session) sees only what came strictly before.
  getLastForWorkout: (workoutId, before) =>
    db.sessions
      .where("[workoutId+date]")
      .between(
        [workoutId, Dexie.minKey],
        [workoutId, before ?? Dexie.maxKey],
        true,
        before === undefined,
      )
      .last(),

  getLastBefore: (date) => db.sessions.where("date").below(date).last(),

  async getExerciseHistory(exerciseId) {
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

  async countSessionsForExercise(exerciseId) {
    const sessions = await db.sessions.toArray()
    return sessions.filter((s) => s.sets.some((set) => set.exerciseId === exerciseId)).length
  },

  countSessionsForWorkout: (workoutId) =>
    db.sessions
      .where("[workoutId+date]")
      .between([workoutId, Dexie.minKey], [workoutId, Dexie.maxKey])
      .count(),

  async save(session) {
    await db.sessions.put(WorkoutSessionSchema.parse(session))
  },
}
