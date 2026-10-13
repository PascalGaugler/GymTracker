import { useLiveQuery } from "dexie-react-hooks"

import { measurementRepository } from "@/data/repositories"

import {
  buildBodyweightTrend,
  buildMeasurementComparison,
  type BodyweightTrend,
  type MeasurementComparison,
} from "../body"

export interface BodyData {
  trend: BodyweightTrend
  comparison: MeasurementComparison
}

export function useBodyData(): BodyData | undefined {
  return useLiveQuery(async () => {
    const [bodyweight, waist, chest, biceps] = await Promise.all([
      measurementRepository.getByType("bodyweight"),
      measurementRepository.getByType("waist"),
      measurementRepository.getByType("chest"),
      measurementRepository.getByType("biceps"),
    ])
    return {
      trend: buildBodyweightTrend(bodyweight),
      comparison: buildMeasurementComparison({ waist, chest, biceps }),
    }
  }, [])
}
