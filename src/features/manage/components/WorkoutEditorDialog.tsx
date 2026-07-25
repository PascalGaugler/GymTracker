import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { workoutRepository } from "@/data/repositories"
import type { Workout } from "@/data/schema"

import { useWorkoutUsage } from "../hooks/useWorkoutUsage"

// Create (workout === null), rename or delete a workout. Only the name is edited
// here — exercise slots have their own screen.
export function WorkoutEditorDialog({
  workout,
  planId,
  order,
  open,
  onOpenChange,
  onDeleted,
}: {
  workout: Workout | null
  planId: string
  /** Rotation position for a newly created workout. */
  order: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(workout ? "manage.workouts.editTitle" : "manage.workouts.newTitle")}
          </DialogTitle>
          <DialogDescription>
            {t(
              workout
                ? "manage.workouts.editDescription"
                : "manage.workouts.newDescription",
            )}
          </DialogDescription>
        </DialogHeader>
        <WorkoutForm
          key={workout?.id ?? "new"}
          workout={workout}
          planId={planId}
          order={order}
          onDone={() => onOpenChange(false)}
          onDeleted={onDeleted}
        />
      </DialogContent>
    </Dialog>
  )
}

function WorkoutForm({
  workout,
  planId,
  order,
  onDone,
  onDeleted,
}: {
  workout: Workout | null
  planId: string
  order: number
  onDone: () => void
  onDeleted?: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(workout?.name ?? "")
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const usage = useWorkoutUsage(workout?.id)

  const trimmed = name.trim()
  const usageKnown = usage !== undefined
  const hasHistory = (usage ?? 0) > 0

  async function handleSave() {
    if (!trimmed) return
    setBusy(true)
    try {
      await workoutRepository.save({
        id: workout?.id ?? crypto.randomUUID(),
        planId,
        name: trimmed,
        order: workout?.order ?? order,
        exercises: workout?.exercises ?? [],
      })
      toast.success(t("manage.workouts.saved"))
      onDone()
    } catch {
      toast.error(t("manage.workouts.saveError"))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!workout) return
    setBusy(true)
    try {
      await workoutRepository.remove(workout.id)
      toast.success(t("manage.workouts.deleted"))
      onDone()
      onDeleted?.()
    } catch {
      toast.error(t("manage.workouts.deleteError"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        void handleSave()
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-caption font-medium text-muted-foreground">
          {t("manage.workouts.fields.name")}
        </span>
        <Input
          autoFocus={!workout}
          className="h-11"
          value={name}
          placeholder={t("manage.workouts.fields.namePlaceholder")}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      {workout && confirmingDelete && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-caption text-destructive"
        >
          {hasHistory
            ? t("manage.workouts.deleteWarning", { count: usage })
            : t("manage.workouts.deleteHint")}
        </p>
      )}

      <DialogFooter className="gap-2">
        {workout &&
          (confirmingDelete ? (
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              className="h-11 sm:mr-auto"
              onClick={() => void handleDelete()}
            >
              {t("manage.workouts.deleteAnyway")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              disabled={busy || !usageKnown}
              className="h-11 text-destructive hover:text-destructive sm:mr-auto"
              onClick={() => setConfirmingDelete(true)}
            >
              {t("manage.workouts.delete")}
            </Button>
          ))}
        <Button type="submit" disabled={busy || !trimmed} className="h-11">
          {t("manage.workouts.save")}
        </Button>
      </DialogFooter>
    </form>
  )
}
