import { useTranslation } from "react-i18next"
import { Link, Navigate, useParams } from "react-router-dom"

import { Card } from "@/components/ui/card"
import { SegmentedScroller, pickChipVariants } from "@/components/ui/segmented"
import { EmptyState } from "@/pages/EmptyState"

import { useExerciseDrilldown } from "../hooks/useExerciseDrilldown"
import { useExercisesWithHistory, type ExerciseOption } from "../hooks/useExercisesWithHistory"
import { StatTile } from "./StatTile"
import { ExerciseDrilldownChart } from "./ExerciseDrilldownChart"

function ExercisePicker({
  options,
  selectedId,
}: {
  options: ExerciseOption[]
  selectedId: string
}) {
  return (
    <SegmentedScroller>
      <div className="flex gap-2">
        {options.map((o) => (
          <Link
            key={o.id}
            to={`/progress/exercise/${o.id}`}
            replace
            aria-current={o.id === selectedId ? "page" : undefined}
            className={pickChipVariants({ active: o.id === selectedId })}
          >
            {o.name}
          </Link>
        ))}
      </div>
    </SegmentedScroller>
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

  const change = drilldown.data.changeSinceStart

  return (
    <Card className="gap-3.5 px-3.5 pt-4.5 pb-4">
      <p className="font-mono text-micro tracking-normal text-subtle">
        {t("progress.exercise.caption")}
      </p>
      <div className="@container grid grid-cols-3 gap-2">
        <StatTile
          value={String(drilldown.data.latestTop)}
          unit={drilldown.unit}
          label={t("progress.exercise.stats.current")}
        />
        <StatTile
          value={
            change == null ? "–" : `${change > 0 ? "+" : change < 0 ? "−" : ""}${Math.abs(change)}`
          }
          label={t("progress.exercise.stats.sinceStart")}
          tone={change != null && change > 0 ? "good" : "default"}
        />
        <StatTile
          value={String(drilldown.data.sessionCount)}
          label={t("progress.exercise.stats.sessions")}
        />
      </div>
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
