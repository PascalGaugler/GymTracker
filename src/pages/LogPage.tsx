import { useParams } from "react-router-dom"

import type { WorkoutSession } from "@/data/schema"
import { useSelectedDay } from "@/features/day/useSelectedDay"
import { ActiveSession } from "@/features/training/components/ActiveSession"
import { WorkoutPicker } from "@/features/training/components/WorkoutPicker"
import { useSessionsOnDay } from "@/features/training/hooks/useSessionLog"

// /log/:sessionId opens that exact session, independent of the selected day
// (also used to correct a past one). /log itself is day-aware: the selected
// day already has a session → open it directly (rendered inline here, not a
// redirect — a redirect to /log/:id would put another entry on the history
// stack and make the back button bounce between the two). No session on that
// day → the workout picker (backfill when the day is in the past).
export function LogPage() {
  const { sessionId } = useParams()
  const { day } = useSelectedDay()
  const sessionsOnDay = useSessionsOnDay(day)

  if (sessionId) return <ActiveSession sessionId={sessionId} />
  if (sessionsOnDay === undefined) return null

  // One workout per day; a legacy day with several sessions opens the most
  // recent one.
  const latest = sessionsOnDay.reduce<WorkoutSession | undefined>(
    (latestSoFar, s) => (!latestSoFar || s.date > latestSoFar.date ? s : latestSoFar),
    undefined,
  )

  return latest ? <ActiveSession sessionId={latest.id} returnTo="/" /> : <WorkoutPicker />
}
