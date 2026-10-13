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
import { planRepository } from "@/data/repositories"
import type { TrainingPlan } from "@/data/schema"

// Keyed by id so the form remounts with fresh state seeded via initializers.
export function PlanEditorDialog({
  plan,
  open,
  onOpenChange,
  activateOnCreate = false,
  workoutCount = 0,
  onDeleted,
}: {
  plan: TrainingPlan | null
  open: boolean
  onOpenChange: (open: boolean) => void
  activateOnCreate?: boolean
  workoutCount?: number
  onDeleted?: () => void
}) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(plan ? "manage.plans.editTitle" : "manage.plans.newTitle")}</DialogTitle>
          <DialogDescription>
            {t(plan ? "manage.plans.editDescription" : "manage.plans.newDescription")}
          </DialogDescription>
        </DialogHeader>
        <PlanForm
          key={plan?.id ?? "new"}
          plan={plan}
          activateOnCreate={activateOnCreate}
          workoutCount={workoutCount}
          onDone={() => onOpenChange(false)}
          onDeleted={onDeleted}
        />
      </DialogContent>
    </Dialog>
  )
}

function PlanForm({
  plan,
  activateOnCreate,
  workoutCount,
  onDone,
  onDeleted,
}: {
  plan: TrainingPlan | null
  activateOnCreate: boolean
  workoutCount: number
  onDone: () => void
  onDeleted?: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(plan?.name ?? "")
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const trimmed = name.trim()

  async function handleSave() {
    if (!trimmed) return
    setBusy(true)
    try {
      await planRepository.save({
        id: plan?.id ?? crypto.randomUUID(),
        name: trimmed,
        isActive: plan?.isActive ?? activateOnCreate,
        createdAt: plan?.createdAt ?? new Date(),
      })
      toast.success(t("manage.plans.saved"))
      onDone()
    } catch {
      toast.error(t("manage.plans.saveError"))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!plan) return
    setBusy(true)
    try {
      await planRepository.remove(plan.id)
      toast.success(t("manage.plans.deleted"))
      onDone()
      onDeleted?.()
    } catch {
      toast.error(t("manage.plans.deleteError"))
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
          {t("manage.plans.fields.name")}
        </span>
        <Input
          autoFocus={!plan}
          value={name}
          placeholder={t("manage.plans.fields.namePlaceholder")}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      {plan && confirmingDelete && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-caption text-destructive"
        >
          {t("manage.plans.deleteWarning", { count: workoutCount })}
        </p>
      )}

      <DialogFooter className="gap-2">
        {plan &&
          (confirmingDelete ? (
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              className="sm:mr-auto"
              onClick={() => void handleDelete()}
            >
              {t("manage.plans.deleteAnyway")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              className="text-destructive hover:text-destructive sm:mr-auto"
              onClick={() => setConfirmingDelete(true)}
            >
              {t("manage.plans.delete")}
            </Button>
          ))}
        <Button type="submit" disabled={busy || !trimmed}>
          {t("manage.plans.save")}
        </Button>
      </DialogFooter>
    </form>
  )
}
