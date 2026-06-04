import { db } from "../../db"
import { ExerciseSchema } from "../../schema"
import type { ExerciseRepository } from "../types"

export const exerciseRepository: ExerciseRepository = {
  getAll: () => db.exercises.orderBy("name").toArray(),

  getById: (id) => db.exercises.get(id),

  search(query) {
    const q = query.trim().toLowerCase()
    if (!q) return db.exercises.orderBy("name").toArray()
    return db.exercises
      .filter((e) => e.name.toLowerCase().includes(q))
      .toArray()
      .then((rows) => rows.sort((a, b) => a.name.localeCompare(b.name)))
  },

  async save(exercise) {
    await db.exercises.put(ExerciseSchema.parse(exercise)) // validate on write
  },

  async remove(id) {
    await db.exercises.delete(id)
  },
}
