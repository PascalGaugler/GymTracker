import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Card } from "@/components/ui/card"
import { useWorkoutRotation } from "@/features/training/hooks/useWorkoutRotation"
import type { Workout } from "@/data/schema"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/pages/EmptyState"

import { useWorkoutProgression } from "../hooks/useWorkoutProgression"
import { StrengthProgressionChart } from "./StrengthProgressionChart"

// Horizontally scrollable strip of workout chips (the strip owns any overflow so
// full names stay readable at 320px). Mirrors the Progress segmented control.
function WorkoutSelector({
  workouts,
  selectedId,
  onSelect,
}: {
  workouts: Workout[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <nav className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="inline-flex gap-1 rounded-lg bg-surface-2 p-1">
        {workouts.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onSelect(w.id)}
            aria-pressed={w.id === selectedId}
            className={cn(
              "flex min-h-(--tap) items-center rounded-md px-4 text-caption font-medium whitespace-nowrap transition-colors",
              w.id === selectedId
                ? "bg-surface text-foreground shadow-elev-1"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {w.name}
          </button>
        ))}
      </div>
    </nav>
  )
}

// One workout's progression: top-set line per exercise, each toggleable. Keyed by
// workout id from the parent, so toggle state resets when the workout changes.
function WorkoutProgression({ workout }: { workout: Workout }) {
  const { t } = useTranslation()
  const data = useWorkoutProgression(workout)
  const [hidden, setHidden] = useState<Set<string>>(() => new Set())

  if (data === undefined) return null

  if (data.series.length === 0) {
    return (
      <EmptyState
        title={t("progress.strength.empty.title")}
        body={t("progress.strength.empty.body")}
      />
    )
  }

  const visible = data.series.filter((s) => !hidden.has(s.exerciseId))

  function toggle(exerciseId: string) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(exerciseId)) next.delete(exerciseId)
      else next.add(exerciseId)
      return next
    })
  }

  return (
    <Card className="gap-4 p-4">
      <p className="text-caption text-muted-foreground">{t("progress.strength.caption")}</p>

      <StrengthProgressionChart data={data} visible={visible} />

      <div className="flex flex-wrap gap-2">
        {data.series.map((s) => {
          const on = !hidden.has(s.exerciseId)
          return (
            <button
              key={s.exerciseId}
              type="button"
              onClick={() => toggle(s.exerciseId)}
              aria-pressed={on}
              className={cn(
                "inline-flex min-h-(--tap) min-w-0 max-w-full items-center gap-2 rounded-full border px-3 text-caption font-medium transition-colors",
                on ? "bg-surface-2" : "border-border text-subtle",
              )}
              style={on ? { borderColor: s.color, color: s.color } : undefined}
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: on ? s.color : "var(--border-strong)" }}
                aria-hidden="true"
              />
              <span className="truncate">{s.name}</span>
            </button>
          )
        })}
      </div>

      <p className="text-caption text-subtle">{t("progress.strength.swapHint")}</p>
    </Card>
  )
}

// Per-workout strength progression view (/progress/strength): pick a workout,
// then read each exercise's top-set trend. Empty when there is no active plan.
export function StrengthProgressionView() {
  const { t } = useTranslation()
  const rotation = useWorkoutRotation()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (rotation === undefined) return null

  const { workouts, nextWorkoutId } = rotation
  if (workouts.length === 0) {
    return (
      <EmptyState
        title={t("progress.strength.noPlan.title")}
        body={t("progress.strength.noPlan.body")}
      />
    )
  }

  const selected =
    workouts.find((w) => w.id === selectedId) ??
    workouts.find((w) => w.id === nextWorkoutId) ??
    workouts[0]

  return (
    <div className="flex flex-col gap-4">
      <WorkoutSelector
        workouts={workouts}
        selectedId={selected.id}
        onSelect={setSelectedId}
      />
      <WorkoutProgression key={selected.id} workout={selected} />
    </div>
  )
}
