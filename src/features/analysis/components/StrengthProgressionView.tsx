import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Card } from "@/components/ui/card"
import {
  SegmentedScroller,
  segmentedItemVariants,
  segmentedListVariants,
} from "@/components/ui/segmented"
import { useWorkoutRotation } from "@/features/training/hooks/useWorkoutRotation"
import type { Workout } from "@/data/schema"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/pages/EmptyState"

import { useWorkoutProgression } from "../hooks/useWorkoutProgression"
import { StrengthProgressionChart } from "./StrengthProgressionChart"

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
    <SegmentedScroller>
      <div className={segmentedListVariants()}>
        {workouts.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onSelect(w.id)}
            aria-pressed={w.id === selectedId}
            className={segmentedItemVariants({ active: w.id === selectedId })}
          >
            {w.name}
          </button>
        ))}
      </div>
    </SegmentedScroller>
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
    <Card className="gap-3.5 px-3.5 pt-4.5 pb-4">
      <p className="font-mono text-micro tracking-normal text-subtle">
        {t("progress.strength.caption")}
      </p>

      <StrengthProgressionChart data={data} visible={visible} />

      {/* Each chip: tap the label to show/hide its line; the chevron drills into
          the single-exercise view (Phase 7's "drilled into from elsewhere"). */}
      <div className="flex flex-wrap gap-2">
        {data.series.map((s) => {
          const on = !hidden.has(s.exerciseId)
          return (
            <div
              key={s.exerciseId}
              className={cn(
                "inline-flex min-h-(--tap) max-w-full items-center rounded-xl border transition-colors",
                on ? "bg-surface-2" : "border-border",
              )}
              style={on ? { borderColor: s.color } : undefined}
            >
              <button
                type="button"
                onClick={() => toggle(s.exerciseId)}
                aria-pressed={on}
                className={cn(
                  "inline-flex min-w-0 items-center gap-2 self-stretch rounded-l-xl py-1 pr-2 pl-3 text-caption font-medium",
                  on ? "" : "text-subtle",
                )}
                style={on ? { color: s.color } : undefined}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: on ? s.color : "var(--border-strong)" }}
                  aria-hidden="true"
                />
                <span className="line-clamp-2 text-left wrap-break-word">{s.name}</span>
              </button>
              <Link
                to={`/progress/exercise/${s.exerciseId}`}
                aria-label={t("progress.strength.openExercise", { name: s.name })}
                className="flex min-w-(--tap) shrink-0 items-center justify-center self-stretch rounded-r-xl border-l border-border text-subtle hover:text-foreground"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
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
      <WorkoutSelector workouts={workouts} selectedId={selected.id} onSelect={setSelectedId} />
      <WorkoutProgression key={selected.id} workout={selected} />
    </div>
  )
}
