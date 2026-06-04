import { ChevronRight, Dumbbell } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { useExerciseCatalog } from "@/features/training/hooks/useExerciseCatalog"
import { useWorkoutRotation } from "@/features/training/hooks/useWorkoutRotation"

const CHIP_LIMIT = 4

// Dashboard quick-action: the rotation-suggested workout, opening straight into
// a fresh logging session (same mint-UUID + router-state flow as the picker, so
// no draft is persisted until the user saves). Renders nothing when there is no
// active plan / no workouts — the picker on /log owns that empty state.
export function TodayWorkoutCard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rotation = useWorkoutRotation()
  const catalog = useExerciseCatalog()

  if (rotation === undefined || catalog === undefined) return null

  const { workouts, nextWorkoutId } = rotation
  const next = workouts.find((w) => w.id === nextWorkoutId)
  if (!next) return null

  const names = next.exercises.map((e) => catalog.get(e.exerciseId)?.name ?? "?")

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-h3 font-semibold">{t("dashboard.today.title")}</h2>
      <button
        type="button"
        onClick={() => navigate(`/log/${crypto.randomUUID()}`, { state: { workoutId: next.id } })}
        className="w-full rounded-lg border border-primary/60 bg-surface p-4 text-left shadow-elev-1 transition-colors hover:border-primary"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono text-micro tracking-[0.16em] text-primary uppercase">
              {t("log.rotation", { n: next.order + 1, total: workouts.length })}
            </div>
            <div className="mt-0.5 text-h3 font-semibold">{next.name}</div>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Dumbbell className="size-5" aria-hidden="true" />
          </span>
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

        <div className="mt-3 flex items-center gap-1 text-label font-medium text-primary">
          {t("dashboard.today.cta")}
          <ChevronRight className="size-4" aria-hidden="true" />
        </div>
      </button>
    </section>
  )
}
