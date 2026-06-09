import { useState } from "react"
import type { ParseKeys } from "i18next"
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
import { exerciseRepository } from "@/data/repositories"
import { ExerciseType, type Exercise, WeightUnit } from "@/data/schema"
import { cn } from "@/lib/utils"

import { useExerciseUsage } from "../hooks/useExerciseUsage"

const TYPE_LABEL: Record<Exercise["type"], ParseKeys> = {
  barbell: "manage.exercises.types.barbell",
  dumbbell: "manage.exercises.types.dumbbell",
  machine: "manage.exercises.types.machine",
  cable: "manage.exercises.types.cable",
  bodyweight: "manage.exercises.types.bodyweight",
}

// Create (exercise === null) or edit an existing catalog exercise. The form lives
// in its own component keyed by id so it remounts with fresh fields whenever the
// target changes — seeds state via initializers (no set-state-in-effect).
export function ExerciseEditorDialog({
  exercise,
  open,
  onOpenChange,
}: {
  exercise: Exercise | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(exercise ? "manage.exercises.editTitle" : "manage.exercises.newTitle")}
          </DialogTitle>
          <DialogDescription>
            {t(
              exercise
                ? "manage.exercises.editDescription"
                : "manage.exercises.newDescription",
            )}
          </DialogDescription>
        </DialogHeader>
        <ExerciseForm
          key={exercise?.id ?? "new"}
          exercise={exercise}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function ExerciseForm({
  exercise,
  onDone,
}: {
  exercise: Exercise | null
  onDone: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(exercise?.name ?? "")
  const [type, setType] = useState<Exercise["type"]>(exercise?.type ?? "barbell")
  const [unit, setUnit] = useState<Exercise["unit"]>(exercise?.unit ?? "kg")
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const usage = useExerciseUsage(exercise?.id)

  const trimmed = name.trim()
  const usageKnown = usage !== undefined
  const hasHistory = (usage ?? 0) > 0

  async function handleSave() {
    if (!trimmed) return
    setBusy(true)
    try {
      await exerciseRepository.save({
        id: exercise?.id ?? crypto.randomUUID(),
        name: trimmed,
        type,
        unit,
        createdAt: exercise?.createdAt ?? new Date(),
      })
      toast.success(t("manage.exercises.saved"))
      onDone()
    } catch {
      toast.error(t("manage.exercises.saveError"))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!exercise) return
    setBusy(true)
    try {
      await exerciseRepository.remove(exercise.id)
      toast.success(t("manage.exercises.deleted"))
      onDone()
    } catch {
      toast.error(t("manage.exercises.deleteError"))
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
          {t("manage.exercises.fields.name")}
        </span>
        <Input
          autoFocus={!exercise}
          className="h-11"
          value={name}
          placeholder={t("manage.exercises.fields.namePlaceholder")}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <SegmentedField
        label={t("manage.exercises.fields.type")}
        options={ExerciseType.options}
        value={type}
        onChange={setType}
        renderLabel={(opt) => t(TYPE_LABEL[opt])}
      />

      <SegmentedField
        label={t("manage.exercises.fields.unit")}
        options={WeightUnit.options}
        value={unit}
        onChange={setUnit}
        renderLabel={(opt) => opt}
      />

      {exercise && confirmingDelete && hasHistory && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-caption text-destructive"
        >
          {t("manage.exercises.deleteWarning", { count: usage })}
        </p>
      )}

      <DialogFooter className="gap-2">
        {exercise &&
          (confirmingDelete ? (
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              className="h-11 sm:mr-auto"
              onClick={() => void handleDelete()}
            >
              {t(hasHistory ? "manage.exercises.deleteAnyway" : "manage.exercises.deleteConfirm")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              disabled={busy || !usageKnown}
              className="h-11 text-destructive hover:text-destructive sm:mr-auto"
              onClick={() => setConfirmingDelete(true)}
            >
              {t("manage.exercises.delete")}
            </Button>
          ))}
        <Button type="submit" disabled={busy || !trimmed} className="h-11">
          {t("manage.exercises.save")}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Compact segmented selector for small, fixed option sets (equipment, unit).
// Wraps at 320px so every option stays tappable. Tokens only — not shadcn.
function SegmentedField<T extends string>({
  label,
  options,
  value,
  onChange,
  renderLabel,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  renderLabel: (option: T) => string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-caption font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = opt === value
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt)}
              className={cn(
                "min-h-(--tap) min-w-0 rounded-md border px-3 text-caption font-medium transition-colors",
                active
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
              )}
            >
              {renderLabel(opt)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
