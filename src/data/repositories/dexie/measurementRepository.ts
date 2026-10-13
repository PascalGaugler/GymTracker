import Dexie from "dexie"
import { startOfDay, endOfDay } from "date-fns"
import { db } from "../../db"
import { MeasurementSchema, MeasurementType } from "../../schema"
import type { MeasurementRepository } from "../types"

export const measurementRepository: MeasurementRepository = {
  getByType: (type) =>
    db.measurements
      .where("[type+measuredAt]")
      .between([type, Dexie.minKey], [type, Dexie.maxKey])
      .toArray(),

  getLatest: (type) =>
    db.measurements
      .where("[type+measuredAt]")
      .between([type, Dexie.minKey], [type, Dexie.maxKey])
      .last(),

  // One range per type (no cross-type index), flattened in memory.
  async getByDate(date) {
    const from = startOfDay(date)
    const to = endOfDay(date)
    const perType = await Promise.all(
      MeasurementType.options.map((type) =>
        db.measurements
          .where("[type+measuredAt]")
          .between([type, from], [type, to], true, true)
          .toArray(),
      ),
    )
    return perType.flat()
  },

  async add(input) {
    const measurement = MeasurementSchema.parse({ ...input, id: crypto.randomUUID() })
    await db.measurements.put(measurement)
    return measurement
  },

  async save(measurement) {
    await db.measurements.put(MeasurementSchema.parse(measurement))
  },

  async remove(id) {
    await db.measurements.delete(id)
  },
}
