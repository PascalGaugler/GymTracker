import { useParams } from "react-router-dom"

import type { WorkoutSession } from "@/data/schema"
import { useSelectedDay } from "@/features/day/useSelectedDay"
import { ActiveSession } from "@/features/training/components/ActiveSession"
import { WorkoutPicker } from "@/features/training/components/WorkoutPicker"
import { useSessionsOnDay } from "@/features/training/hooks/useSessionLog"

// /log renders the selected day's session inline instead of redirecting, so back doesn't bounce between /log and /log/:id.
export function LogPage() {
  const { sessionId } = useParams()
  const { day } = useSelectedDay()
  const sessionsOnDay = useSessionsOnDay(day)

  if (sessionId) return <ActiveSession sessionId={sessionId} />
  if (sessionsOnDay === undefined) return null

  // Legacy days may hold several sessions; open the most recent.
  const latest = sessionsOnDay.reduce<WorkoutSession | undefined>(
    (latestSoFar, s) => (!latestSoFar || s.date > latestSoFar.date ? s : latestSoFar),
    undefined,
  )

  return latest ? <ActiveSession sessionId={latest.id} returnTo="/" /> : <WorkoutPicker />
}
