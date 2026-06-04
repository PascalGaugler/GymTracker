import { useEffect, useMemo, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { sessionRepository } from "@/data/repositories"
import type { Exercise, LoggedSet, Workout, WorkoutSession } from "@/data/schema"

import { useExerciseCatalog } from "../hooks/useExerciseCatalog"
import { useLastSession, useSession, useWorkout } from "../hooks/useSessionLog"
import { ExerciseLogCard } from "./ExerciseLogCard"

interface LocationState {
  workoutId?: string
}

// Loader for /log/:sessionId. A freshly picked workout arrives as an in-memory
// draft (workout id via router state) and is persisted only on save; an existing
// session id loads its saved sets for correction. Once everything has resolved,
// the form is mounted keyed by session id so it can seed its state once.
export function ActiveSession({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const stateWorkoutId = (location.state as LocationState | null)?.workoutId

  const session = useSession(sessionId) // undefined = loading · null = draft · object = saved
  const workoutId = session?.workoutId ?? stateWorkoutId
  const workout = useWorkout(workoutId)
  const catalog = useExerciseCatalog()
  const lastSession = useLastSession(workoutId)

  // A draft opened without a workout (e.g. refresh on an unsaved url) cannot be
  // reconstructed — send the user back to the picker.
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
      lastSession={lastSession}
    />
  )
}

interface SessionFormProps {
  sessionId: string
  workoutId: string
  workout: Workout
  session: WorkoutSession | null
  catalog: Map<string, Exercise>
  lastSession: WorkoutSession | undefined
}

// Pre-fill any already-saved sets so editing shows current values; a draft
// starts blank.
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
  lastSession,
}: SessionFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Entered weights, keyed by slot id → one string per set.
  const [values, setValues] = useState(() => buildInitialValues(workout, session))
  const [saving, setSaving] = useState(false)

  // Last-weight placeholders, skipping this session itself when re-editing.
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
        date: session?.date ?? new Date(),
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
      <header className="mb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={t("common.back")}
          onClick={() => navigate("/log")}
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div className="min-w-0">
          <div className="font-mono text-micro tracking-[0.16em] text-primary uppercase">
            {t("nav.log")}
          </div>
          <h1 className="text-h2 font-bold">{workout.name}</h1>
        </div>
      </header>

      <div className="mb-5 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
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

      <Button
        className="mt-5 h-12 w-full text-body-lg"
        disabled={saving}
        onClick={handleSave}
      >
        {t("log.save")}
      </Button>
    </>
  )
}
