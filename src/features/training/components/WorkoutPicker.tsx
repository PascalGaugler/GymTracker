import { ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { EmptyState } from "@/pages/EmptyState"
import { PageHeader } from "@/pages/PageHeader"
import { cn } from "@/lib/utils"

import { useExerciseCatalog } from "../hooks/useExerciseCatalog"
import { useWorkoutRotation } from "../hooks/useWorkoutRotation"

const CHIP_LIMIT = 3

// Today's workout via rotation (suggested first) plus the rest, or pick any.
// Picking mints a session id and opens the active session, carrying the chosen
// workout in router state (the draft is only persisted once the user saves).
export function WorkoutPicker() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rotation = useWorkoutRotation()
  const catalog = useExerciseCatalog()

  if (rotation === undefined || catalog === undefined) return null

  const { workouts, nextWorkoutId } = rotation
  if (workouts.length === 0) {
    return (
      <>
        <PageHeader overline={t("nav.log")} title={t("log.pick.title")} />
        <EmptyState title={t("log.empty.title")} body={t("log.empty.body")} />
      </>
    )
  }

  const ordered = [...workouts].sort((a, b) => {
    if (a.id === nextWorkoutId) return -1
    if (b.id === nextWorkoutId) return 1
    return a.order - b.order
  })
  const next = workouts.find((w) => w.id === nextWorkoutId)

  function start(workoutId: string) {
    navigate(`/log/${crypto.randomUUID()}`, { state: { workoutId } })
  }

  return (
    <>
      <PageHeader
        overline={t("log.pick.subtitle", { total: workouts.length })}
        title={t("log.pick.title")}
      />

      {next && (
        <p className="mb-5 text-body text-muted-foreground">
          {t("log.pick.hint", { name: next.name })}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {ordered.map((w) => {
          const isNext = w.id === nextWorkoutId
          const totalSets = w.exercises.reduce((sum, e) => sum + e.targetSets, 0)
          const names = w.exercises.map(
            (e) => catalog.get(e.exerciseId)?.name ?? "?",
          )
          return (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => start(w.id)}
                className={cn(
                  "w-full rounded-lg border bg-surface p-4 text-left shadow-elev-1 transition-colors hover:border-border-strong",
                  isNext ? "border-primary" : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-micro tracking-[0.16em] text-primary uppercase">
                      {t("log.rotation", { n: w.order + 1, total: workouts.length })}
                    </div>
                    <div className="mt-0.5 text-h3 font-semibold">{w.name}</div>
                  </div>
                  {isNext ? (
                    <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 font-mono text-micro tracking-[0.16em] text-primary uppercase">
                      {t("log.pick.next")}
                    </span>
                  ) : (
                    <ChevronRight
                      className="size-5 shrink-0 text-subtle"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="mt-2 font-mono text-caption text-muted-foreground">
                  {t("log.summary", { exercises: w.exercises.length, sets: totalSets })}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {names.slice(0, CHIP_LIMIT).map((name, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-surface-2 px-2 py-1 text-caption text-muted-foreground"
                    >
                      {name}
                    </span>
                  ))}
                  {names.length > CHIP_LIMIT && (
                    <span className="rounded-md bg-surface-2 px-2 py-1 text-caption text-subtle">
                      +{names.length - CHIP_LIMIT}
                    </span>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
