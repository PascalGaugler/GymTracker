import { useState } from "react"
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, Navigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { planRepository, workoutRepository } from "@/data/repositories"
import type { Workout } from "@/data/schema"
import { EmptyState } from "@/pages/EmptyState"

import { usePlanDetail } from "../hooks/usePlanDetail"
import { moveItem, nextOrder, reindex } from "../ordering"
import { PlanEditorDialog } from "./PlanEditorDialog"
import { ReorderRow } from "./ReorderRow"
import { WorkoutEditorDialog } from "./WorkoutEditorDialog"

// A plan's workouts in rotation order. Reordering rewrites `order` on the moved
// workouts only; the Log rotation follows this list for the active plan.
export function PlanDetailView() {
  const { t } = useTranslation()
  const { planId } = useParams()
  const detail = usePlanDetail(planId)
  const [editingPlan, setEditingPlan] = useState(false)
  const [addingWorkout, setAddingWorkout] = useState(false)

  if (detail === undefined) return null
  if (detail === null) return <Navigate to="/manage/plans" replace />

  const { plan, workouts } = detail

  async function move(index: number, delta: -1 | 1) {
    const reordered = reindex(moveItem(workouts, index, delta))
    const before = new Map(workouts.map((w) => [w.id, w.order]))
    try {
      await Promise.all(
        reordered
          .filter((w) => before.get(w.id) !== w.order)
          .map((w) => workoutRepository.save(w)),
      )
    } catch {
      toast.error(t("manage.workouts.saveError"))
    }
  }

  async function activate() {
    try {
      await planRepository.setActive(plan.id)
      toast.success(t("manage.plans.activated"))
    } catch {
      toast.error(t("manage.plans.saveError"))
    }
  }

  return (
    <>
      <Link
        to="/manage/plans"
        className="mb-3 -ml-2 inline-flex min-h-(--tap) items-center gap-1 rounded-md px-2 text-caption font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {t("manage.plans.backToList")}
      </Link>

      <div className="mb-5 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {plan.isActive && (
            <div className="font-mono text-micro tracking-[0.16em] text-primary uppercase">
              {t("manage.plans.active")}
            </div>
          )}
          <h2 className="text-h2 font-semibold wrap-break-word">{plan.name}</h2>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="size-11 shrink-0"
          aria-label={t("manage.plans.editTitle")}
          onClick={() => setEditingPlan(true)}
        >
          <Pencil className="size-4" />
        </Button>
      </div>

      {!plan.isActive && (
        <Button variant="outline" className="mb-5 h-11 w-full" onClick={() => void activate()}>
          {t("manage.plans.activate")}
        </Button>
      )}

      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-h3 font-semibold">
          {t("manage.workouts.title")}
        </h3>
        <Button
          className="size-11 shrink-0"
          size="icon"
          aria-label={t("manage.workouts.add")}
          onClick={() => setAddingWorkout(true)}
        >
          <Plus className="size-5" />
        </Button>
      </div>

      {workouts.length === 0 ? (
        <EmptyState
          title={t("manage.workouts.empty.title")}
          body={t("manage.workouts.empty.body")}
        >
          <Button onClick={() => setAddingWorkout(true)}>
            <Plus className="size-4" />
            {t("manage.workouts.add")}
          </Button>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {workouts.map((workout, index) => (
            <WorkoutRow
              key={workout.id}
              workout={workout}
              index={index}
              total={workouts.length}
              onMove={(delta) => void move(index, delta)}
            />
          ))}
        </ul>
      )}

      <PlanEditorDialog
        plan={plan}
        open={editingPlan}
        onOpenChange={setEditingPlan}
        workoutCount={workouts.length}
      />
      <WorkoutEditorDialog
        workout={null}
        planId={plan.id}
        order={nextOrder(workouts)}
        open={addingWorkout}
        onOpenChange={setAddingWorkout}
      />
    </>
  )
}

function WorkoutRow({
  workout,
  index,
  total,
  onMove,
}: {
  workout: Workout
  index: number
  total: number
  onMove: (delta: -1 | 1) => void
}) {
  const { t } = useTranslation()
  const sets = workout.exercises.reduce((sum, e) => sum + e.targetSets, 0)

  return (
    <li className="rounded-lg border border-border bg-surface shadow-elev-1">
      <Link
        to={`/manage/plans/${workout.planId}/workouts/${workout.id}`}
        className="flex min-h-(--tap) items-center gap-3 rounded-t-lg p-4 transition-colors hover:bg-surface-2"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-2 font-mono text-caption text-muted-foreground tabular-nums">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-body-lg font-medium">{workout.name}</div>
          <div className="mt-0.5 font-mono text-caption text-muted-foreground">
            {t("manage.workouts.summary", {
              exercises: workout.exercises.length,
              sets,
            })}
          </div>
        </div>
        <ChevronRight className="size-5 shrink-0 text-subtle" aria-hidden="true" />
      </Link>

      {total > 1 && (
        <ReorderRow
          canMoveUp={index > 0}
          canMoveDown={index < total - 1}
          upLabel={t("manage.moveUp", { name: workout.name })}
          downLabel={t("manage.moveDown", { name: workout.name })}
          onMove={onMove}
        />
      )}
    </li>
  )
}
