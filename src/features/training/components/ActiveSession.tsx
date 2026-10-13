import { useEffect, useMemo, useState } from "react"
import { isSameDay } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Overline } from "@/components/ui/overline"
import { sessionRepository } from "@/data/repositories"
import type { Exercise, LoggedSet, Workout, WorkoutSession } from "@/data/schema"
import { stampOnDay } from "@/features/day/day"
import { useSelectedDay } from "@/features/day/useSelectedDay"
import { formatDayLong } from "@/lib/format"

import { useExerciseCatalog } from "../hooks/useExerciseCatalog"
import { useLastSession, useSession, useWorkout } from "../hooks/useSessionLog"
import { useWorkoutRotation } from "../hooks/useWorkoutRotation"
import { ExerciseLogCard } from "./ExerciseLogCard"

interface LocationState {
  workoutId?: string
  // Where the back arrow leads; the `returnTo` prop overrides it.
  returnTo?: string
}

// A fresh draft is persisted only on save; an existing session id loads its saved sets.
// Form is keyed by session id so it seeds state once.
export function ActiveSession({
  sessionId,
  returnTo: returnToProp,
}: {
  sessionId: string
  returnTo?: string
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as LocationState | null
  const stateWorkoutId = locationState?.workoutId

  const session = useSession(sessionId) // undefined = loading · null = draft · object = saved
  const workoutId = session?.workoutId ?? stateWorkoutId
  const workout = useWorkout(workoutId)
  const catalog = useExerciseCatalog()

  // A draft without a workout (e.g. refresh on an unsaved url) can't be reconstructed.
  useEffect(() => {
    if (session === null && !stateWorkoutId) navigate("/log", { replace: true })
  }, [session, stateWorkoutId, navigate])

  if (session === undefined || catalog === undefined || !workout || !workoutId) {
    return null
  }

  return (
    <SessionForm
      key={sessionId}
      sessionId={sessionId}
      workoutId={workoutId}
      workout={workout}
      session={session}
      catalog={catalog}
      returnTo={returnToProp ?? locationState?.returnTo}
    />
  )
}

interface SessionFormProps {
  sessionId: string
  workoutId: string
  workout: Workout
  session: WorkoutSession | null
  catalog: Map<string, Exercise>
  returnTo: string | undefined
}

function buildInitialValues(
  workout: Workout,
  session: WorkoutSession | null,
): Record<string, string[]> {
  const values: Record<string, string[]> = {}
  for (const slot of workout.exercises) {
    const arr = Array.from({ length: slot.targetSets }, () => "")
    if (session) {
      for (const set of session.sets) {
        if (
          set.exerciseId === slot.exerciseId &&
          set.setNumber >= 1 &&
          set.setNumber <= slot.targetSets
        ) {
          arr[set.setNumber - 1] = String(set.weight)
        }
      }
    }
    values[slot.id] = arr
  }
  return values
}

function SessionForm({
  sessionId,
  workoutId,
  workout,
  session,
  catalog,
  returnTo,
}: SessionFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { day } = useSelectedDay()

  // A brand-new draft is dated on the selected day, captured ONCE at mount —
  // a saved session keeps `session.date` and is never re-stamped on edit.
  const [draftDate] = useState(() => stampOnDay(day))
  const date = session?.date ?? draftDate
  const isToday = isSameDay(date, new Date())

  // A workout outside the active plan falls back to the generic "Log" overline.
  const rotation = useWorkoutRotation()
  const inRotation = rotation?.workouts.find((w) => w.id === workoutId)

  // Last-weight placeholders come from the session before THIS one's date —
  // editing an old session shows the session before it, not a later one.
  const lastSession = useLastSession(workoutId, date)

  const [values, setValues] = useState(() => buildInitialValues(workout, session))
  const [saving, setSaving] = useState(false)

  const lastByKey = useMemo(() => {
    const map = new Map<string, number>()
    if (lastSession && lastSession.id !== sessionId) {
      for (const s of lastSession.sets) map.set(`${s.exerciseId}#${s.setNumber}`, s.weight)
    }
    return map
  }, [lastSession, sessionId])

  const totalSets = workout.exercises.reduce((sum, e) => sum + e.targetSets, 0)
  const doneSets = workout.exercises.reduce(
    (sum, e) => sum + (values[e.id]?.filter((v) => v !== "").length ?? 0),
    0,
  )
  const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0

  function onSetChange(slotId: string, setIndex: number, value: string) {
    setValues((prev) => {
      const arr = [...(prev[slotId] ?? [])]
      arr[setIndex] = value
      return { ...prev, [slotId]: arr }
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const sets: LoggedSet[] = []
      for (const slot of workout.exercises) {
        ;(values[slot.id] ?? []).forEach((raw, i) => {
          const weight = parseFloat(raw)
          if (raw !== "" && !Number.isNaN(weight)) {
            sets.push({
              id: crypto.randomUUID(),
              exerciseId: slot.exerciseId,
              setNumber: i + 1,
              weight,
            })
          }
        })
      }
      const toSave: WorkoutSession = {
        id: sessionId,
        workoutId,
        date,
        sets,
      }
      await sessionRepository.save(toSave)
      toast.success(t("log.saved"))
      navigate("/")
    } catch {
      toast.error(t("log.saveError"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* -mx-4 -mt-5 cancel AppLayout's <main> padding so the divider spans edge to edge. */}
      <header className="-mx-4 -mt-5 mb-3 flex items-center gap-3 border-b border-border px-4 py-3">
        <Button
          variant="outline"
          size="icon"
          aria-label={t("common.back")}
          onClick={() => navigate(returnTo ?? "/log")}
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <Overline>
            {!isToday
              ? formatDayLong(date)
              : inRotation && rotation
                ? t("log.rotation", { n: inRotation.order + 1, total: rotation.workouts.length })
                : t("nav.log")}
          </Overline>
          <h1 className="truncate text-h3">{workout.name}</h1>
        </div>
        <span aria-hidden="true" className="size-12 shrink-0" />
      </header>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-caption text-muted-foreground tabular-nums">
          {t("log.progress", { done: doneSets, total: totalSets })}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {workout.exercises.map((slot) => {
          const exercise = catalog.get(slot.exerciseId)
          const lasts = Array.from({ length: slot.targetSets }, (_, i) =>
            lastByKey.get(`${slot.exerciseId}#${i + 1}`),
          )
          return (
            <ExerciseLogCard
              key={slot.id}
              name={exercise?.name ?? "?"}
              unit={exercise?.unit ?? "kg"}
              targetSets={slot.targetSets}
              repRange={slot.repRange}
              values={values[slot.id] ?? []}
              lasts={lasts}
              onSetChange={(i, v) => onSetChange(slot.id, i, v)}
            />
          )
        })}
      </div>

      <Button size="lg" className="mt-5 w-full" disabled={saving} onClick={handleSave}>
        {t("log.save")}
      </Button>
    </>
  )
}
