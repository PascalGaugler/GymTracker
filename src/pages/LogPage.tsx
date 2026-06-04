import { useParams } from "react-router-dom"

import { ActiveSession } from "@/features/training/components/ActiveSession"
import { WorkoutPicker } from "@/features/training/components/WorkoutPicker"

// /log shows the workout picker; /log/:sessionId opens that session for logging.
export function LogPage() {
  const { sessionId } = useParams()

  return sessionId ? <ActiveSession sessionId={sessionId} /> : <WorkoutPicker />
}
