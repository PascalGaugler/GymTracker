import Dexie from "dexie"
import { db } from "../../db"
import { MeasurementSchema } from "../../schema"
import type { MeasurementRepository } from "../types"

export const measurementRepository: MeasurementRepository = {
  // [type+measuredAt] returns one measurement type as an ordered time series.
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

  async add(input) {
    const measurement = MeasurementSchema.parse({ ...input, id: crypto.randomUUID() })
    await db.measurements.put(measurement)
    return measurement
  },
}
