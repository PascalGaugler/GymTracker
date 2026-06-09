import { useTranslation } from "react-i18next"
import { Link, Navigate, useParams } from "react-router-dom"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/pages/EmptyState"

import { useExerciseDrilldown } from "../hooks/useExerciseDrilldown"
import { useExercisesWithHistory, type ExerciseOption } from "../hooks/useExercisesWithHistory"
import { ExerciseDrilldownChart } from "./ExerciseDrilldownChart"

// Horizontally scrollable picker of exercises that have logged history; the strip
// owns any overflow so names stay readable at 320px. Selecting navigates to that
// exercise's drilldown URL (param-based, so it is shareable/deep-linkable).
function ExercisePicker({
  options,
  selectedId,
}: {
  options: ExerciseOption[]
  selectedId: string
}) {
  return (
    <nav className="-mx-4 overflow-x-auto px-4 scrollbar-none [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2">
        {options.map((o) => (
          <Link
            key={o.id}
            to={`/progress/exercise/${o.id}`}
            replace
            aria-current={o.id === selectedId ? "page" : undefined}
            className={cn(
              "flex min-h-(--tap) shrink-0 items-center rounded-full border px-4 text-caption font-medium whitespace-nowrap transition-colors",
              o.id === selectedId
                ? "border-primary bg-primary-soft text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {o.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}

// The chart card for one chosen exercise. Keyed by id from the parent so the
// query re-runs cleanly per selection.
function Drilldown({ exerciseId }: { exerciseId: string }) {
  const { t } = useTranslation()
  const drilldown = useExerciseDrilldown(exerciseId)

  if (drilldown === undefined) return null
  if (drilldown === null || drilldown.data.sessionCount === 0) {
    return (
      <EmptyState
        title={t("progress.exercise.empty.title")}
        body={t("progress.exercise.empty.body")}
      />
    )
  }

  return (
    <Card className="gap-4 p-4">
      <p className="text-caption text-muted-foreground">{t("progress.exercise.caption")}</p>
      <ExerciseDrilldownChart data={drilldown.data} unit={drilldown.unit} />
    </Card>
  )
}

// Single-exercise drilldown view (/progress/exercise/:exerciseId): pick an
// exercise, read its top-set line over the min–max band. With no id (or an
// unknown one) it redirects to the first exercise that has history.
export function ExerciseDrilldownView() {
  const { t } = useTranslation()
  const { exerciseId } = useParams()
  const options = useExercisesWithHistory()

  if (options === undefined) return null

  if (options.length === 0) {
    return (
      <EmptyState
        title={t("progress.exercise.empty.title")}
        body={t("progress.exercise.empty.body")}
      />
    )
  }

  const selected = options.find((o) => o.id === exerciseId)
  if (!selected) {
    return <Navigate to={`/progress/exercise/${options[0].id}`} replace />
  }

  return (
    <div className="flex flex-col gap-4">
      <ExercisePicker options={options} selectedId={selected.id} />
      <Drilldown key={selected.id} exerciseId={selected.id} />
    </div>
  )
}
