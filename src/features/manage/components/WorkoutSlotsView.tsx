import { useState } from "react"
import { ChevronLeft, Pencil, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { workoutRepository } from "@/data/repositories"
import type { WorkoutExercise } from "@/data/schema"
import { EmptyState } from "@/pages/EmptyState"

import { useExerciseList } from "../hooks/useExerciseList"
import { useWorkoutDetail } from "../hooks/useWorkoutDetail"
import { moveItem, reindex } from "../ordering"
import { ReorderRow } from "./ReorderRow"
import { SlotEditorDialog } from "./SlotEditorDialog"
import { WorkoutEditorDialog } from "./WorkoutEditorDialog"

// The slot editor: which exercises a workout prescribes, in which order, with
// how many sets. Slots are embedded, so every change writes the whole workout.
// Past sessions reference catalog exercises directly and are never touched here.
export function WorkoutSlotsView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { planId, workoutId } = useParams()
  const detail = useWorkoutDetail(planId, workoutId)
  const catalog = useExerciseList("")
  const [editingWorkout, setEditingWorkout] = useState(false)
  const [editingSlot, setEditingSlot] = useState<WorkoutExercise | null>(null)
  const [slotOpen, setSlotOpen] = useState(false)

  if (detail === undefined || catalog === undefined) return null
  if (detail === null) return <Navigate to="/manage/plans" replace />

  const { workout, plan } = detail
  const slots = [...workout.exercises].sort((a, b) => a.order - b.order)
  const nameById = new Map(catalog.map((e) => [e.id, e.name]))

  function openSlot(slot: WorkoutExercise | null) {
    setEditingSlot(slot)
    setSlotOpen(true)
  }

  async function move(index: number, delta: -1 | 1) {
    try {
      await workoutRepository.save({
        ...workout,
        exercises: reindex(moveItem(slots, index, delta)),
      })
    } catch {
      toast.error(t("manage.slots.saveError"))
    }
  }

  return (
    <>
      <Link
        to={`/manage/plans/${plan.id}`}
        className="mb-3 -ml-2 inline-flex min-h-(--tap) items-center gap-1 rounded-md px-2 text-caption font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        <span className="min-w-0 truncate">{plan.name}</span>
      </Link>

      <div className="mb-5 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-micro tracking-[0.16em] text-primary uppercase">
            {t("manage.workouts.overline", { n: workout.order + 1 })}
          </div>
          <h2 className="text-h2 font-semibold wrap-break-word">{workout.name}</h2>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="size-11 shrink-0"
          aria-label={t("manage.workouts.editTitle")}
          onClick={() => setEditingWorkout(true)}
        >
          <Pencil className="size-4" />
        </Button>
      </div>

      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-h3 font-semibold">
          {t("manage.slots.title")}
        </h3>
        <Button
          className="size-11 shrink-0"
          size="icon"
          aria-label={t("manage.slots.add")}
          onClick={() => openSlot(null)}
        >
          <Plus className="size-5" />
        </Button>
      </div>

      {slots.length === 0 ? (
        <EmptyState
          title={t("manage.slots.empty.title")}
          body={t("manage.slots.empty.body")}
        >
          <Button onClick={() => openSlot(null)}>
            <Plus className="size-4" />
            {t("manage.slots.add")}
          </Button>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {slots.map((slot, index) => (
            <SlotRow
              key={slot.id}
              slot={slot}
              index={index}
              total={slots.length}
              name={nameById.get(slot.exerciseId)}
              alternatives={slot.alternativeIds
                .map((id) => nameById.get(id))
                .filter((name): name is string => name !== undefined)}
              onEdit={() => openSlot(slot)}
              onMove={(delta) => void move(index, delta)}
            />
          ))}
        </ul>
      )}

      <WorkoutEditorDialog
        workout={workout}
        planId={plan.id}
        order={workout.order}
        open={editingWorkout}
        onOpenChange={setEditingWorkout}
        onDeleted={() => navigate(`/manage/plans/${plan.id}`, { replace: true })}
      />
      <SlotEditorDialog
        workout={workout}
        slot={editingSlot}
        catalog={catalog}
        open={slotOpen}
        onOpenChange={setSlotOpen}
      />
    </>
  )
}

function SlotRow({
  slot,
  index,
  total,
  name,
  alternatives,
  onEdit,
  onMove,
}: {
  slot: WorkoutExercise
  index: number
  total: number
  name: string | undefined
  alternatives: string[]
  onEdit: () => void
  onMove: (delta: -1 | 1) => void
}) {
  const { t } = useTranslation()

  return (
    <li className="rounded-lg border border-border bg-surface shadow-elev-1">
      <button
        type="button"
        onClick={onEdit}
        className="flex min-h-(--tap) w-full items-center gap-3 rounded-t-lg p-4 text-left transition-colors hover:bg-surface-2"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-2 font-mono text-caption text-muted-foreground tabular-nums">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-body-lg font-medium">
            {name ?? t("manage.slots.unknownExercise")}
          </div>
          <div className="mt-0.5 font-mono text-caption text-muted-foreground">
            {slot.repRange
              ? t("log.setsRepRange", {
                  sets: slot.targetSets,
                  low: slot.repRange[0],
                  high: slot.repRange[1],
                })
              : t("log.setsOnly", { sets: slot.targetSets })}
          </div>
          {alternatives.length > 0 && (
            <div className="mt-1 truncate text-caption text-subtle">
              {t("manage.slots.alternatives", { names: alternatives.join(", ") })}
            </div>
          )}
        </div>
        <Pencil className="size-4 shrink-0 text-subtle" aria-hidden="true" />
      </button>

      {total > 1 && (
        <ReorderRow
          canMoveUp={index > 0}
          canMoveDown={index < total - 1}
          upLabel={t("manage.moveUp", { name: name ?? "" })}
          downLabel={t("manage.moveDown", { name: name ?? "" })}
          onMove={onMove}
        />
      )}
    </li>
  )
}
