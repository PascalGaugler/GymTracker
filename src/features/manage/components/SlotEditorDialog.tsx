import { useState, type ReactNode } from "react"
import { ChevronDown, Minus, Plus, X } from "lucide-react"
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
import { workoutRepository } from "@/data/repositories"
import type { Exercise, Workout, WorkoutExercise } from "@/data/schema"
import { cn } from "@/lib/utils"

import { nextOrder } from "../ordering"

const MIN_SETS = 1
const MAX_SETS = 12

// Add (slot === null) or edit one exercise slot of a workout. Slots are embedded
// in their workout, so saving writes the whole workout document in one put.
export function SlotEditorDialog({
  workout,
  slot,
  catalog,
  open,
  onOpenChange,
}: {
  workout: Workout
  slot: WorkoutExercise | null
  /** Catalog exercises, name-sorted — the pickable options. */
  catalog: Exercise[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(slot ? "manage.slots.editTitle" : "manage.slots.newTitle")}
          </DialogTitle>
          <DialogDescription>
            {t(slot ? "manage.slots.editDescription" : "manage.slots.newDescription")}
          </DialogDescription>
        </DialogHeader>
        {catalog.length === 0 ? (
          <p className="text-body text-muted-foreground">{t("manage.slots.noCatalog")}</p>
        ) : (
          <SlotForm
            key={slot?.id ?? "new"}
            workout={workout}
            slot={slot}
            catalog={catalog}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function SlotForm({
  workout,
  slot,
  catalog,
  onDone,
}: {
  workout: Workout
  slot: WorkoutExercise | null
  catalog: Exercise[]
  onDone: () => void
}) {
  const { t } = useTranslation()
  const [exerciseId, setExerciseId] = useState(slot?.exerciseId ?? catalog[0].id)
  const [targetSets, setTargetSets] = useState(slot?.targetSets ?? 3)
  const [repLow, setRepLow] = useState(slot?.repRange ? String(slot.repRange[0]) : "")
  const [repHigh, setRepHigh] = useState(slot?.repRange ? String(slot.repRange[1]) : "")
  const [alternativeIds, setAlternativeIds] = useState<string[]>(slot?.alternativeIds ?? [])
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const nameById = new Map(catalog.map((e) => [e.id, e.name]))
  const remaining = catalog.filter(
    (e) => e.id !== exerciseId && !alternativeIds.includes(e.id),
  )

  // An empty range means "no target"; a half-filled or inverted one is a typo.
  const low = Number(repLow)
  const high = Number(repHigh)
  const rangeEmpty = repLow === "" && repHigh === ""
  const rangeValid = rangeEmpty || (low >= 1 && high >= low)
  const repRange: [number, number] | undefined = rangeEmpty ? undefined : [low, high]

  async function handleSave() {
    if (!rangeValid) return
    setBusy(true)
    try {
      const edited: WorkoutExercise = {
        id: slot?.id ?? crypto.randomUUID(),
        exerciseId,
        targetSets,
        repRange,
        order: slot?.order ?? nextOrder(workout.exercises),
        alternativeIds,
      }
      const exercises = slot
        ? workout.exercises.map((e) => (e.id === slot.id ? edited : e))
        : [...workout.exercises, edited]
      await workoutRepository.save({ ...workout, exercises })
      toast.success(t("manage.slots.saved"))
      onDone()
    } catch {
      toast.error(t("manage.slots.saveError"))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!slot) return
    setBusy(true)
    try {
      await workoutRepository.save({
        ...workout,
        exercises: workout.exercises
          .filter((e) => e.id !== slot.id)
          .map((e, order) => ({ ...e, order })),
      })
      toast.success(t("manage.slots.deleted"))
      onDone()
    } catch {
      toast.error(t("manage.slots.deleteError"))
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
      <Field label={t("manage.slots.fields.exercise")}>
        <ExerciseSelect
          label={t("manage.slots.fields.exercise")}
          value={exerciseId}
          options={catalog.filter(
            (e) => e.id === exerciseId || !alternativeIds.includes(e.id),
          )}
          onChange={setExerciseId}
        />
      </Field>

      <Field label={t("manage.slots.fields.targetSets")}>
        <div className="flex items-center gap-2">
          <StepButton
            label={t("manage.slots.fewerSets")}
            disabled={targetSets <= MIN_SETS}
            onClick={() => setTargetSets((n) => Math.max(MIN_SETS, n - 1))}
          >
            <Minus className="size-5" />
          </StepButton>
          <output className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-md border border-border bg-surface-2 font-mono text-body-lg tabular-nums">
            {targetSets}
          </output>
          <StepButton
            label={t("manage.slots.moreSets")}
            disabled={targetSets >= MAX_SETS}
            onClick={() => setTargetSets((n) => Math.min(MAX_SETS, n + 1))}
          >
            <Plus className="size-5" />
          </StepButton>
        </div>
      </Field>

      <Field label={t("manage.slots.fields.repRange")}>
        <div className="flex items-center gap-2">
          <RepInput
            label={t("manage.slots.fields.repFrom")}
            value={repLow}
            onChange={setRepLow}
          />
          <span className="shrink-0 text-body text-subtle">–</span>
          <RepInput
            label={t("manage.slots.fields.repTo")}
            value={repHigh}
            onChange={setRepHigh}
          />
        </div>
        <p
          className={cn(
            "text-caption",
            rangeValid ? "text-subtle" : "text-destructive",
          )}
        >
          {t(rangeValid ? "manage.slots.repHint" : "manage.slots.repError")}
        </p>
      </Field>

      <Field label={t("manage.slots.fields.alternatives")}>
        {alternativeIds.length === 0 ? (
          <p className="text-caption text-subtle">{t("manage.slots.alternativesHint")}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {alternativeIds.map((id) => (
              <li
                key={id}
                className="flex items-center gap-2 rounded-md border border-border bg-surface-2 pl-3"
              >
                <span className="min-w-0 flex-1 truncate text-caption">
                  {nameById.get(id) ?? "—"}
                </span>
                <button
                  type="button"
                  aria-label={t("manage.slots.removeAlternative", {
                    name: nameById.get(id) ?? "",
                  })}
                  className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() =>
                    setAlternativeIds((ids) => ids.filter((alt) => alt !== id))
                  }
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {remaining.length > 0 && (
          <AlternativePicker
            options={remaining}
            onAdd={(id) => setAlternativeIds((ids) => [...ids, id])}
          />
        )}
      </Field>

      <DialogFooter className="gap-2">
        {slot &&
          (confirmingDelete ? (
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              className="h-11 sm:mr-auto"
              onClick={() => void handleDelete()}
            >
              {t("manage.slots.deleteConfirm")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              className="h-11 text-destructive hover:text-destructive sm:mr-auto"
              onClick={() => setConfirmingDelete(true)}
            >
              {t("manage.slots.delete")}
            </Button>
          ))}
        <Button type="submit" disabled={busy || !rangeValid} className="h-11">
          {t("manage.slots.save")}
        </Button>
      </DialogFooter>
    </form>
  )
}

// A second select + add button, so picking an alternative never leaves the form.
function AlternativePicker({
  options,
  onAdd,
}: {
  options: Exercise[]
  onAdd: (id: string) => void
}) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(options[0].id)
  const selectable = options.some((o) => o.id === draft) ? draft : options[0].id

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <ExerciseSelect
          label={t("manage.slots.addAlternative")}
          value={selectable}
          options={options}
          onChange={setDraft}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11 shrink-0"
        aria-label={t("manage.slots.addAlternative")}
        onClick={() => onAdd(selectable)}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}

// Native <select>: on phones it opens the platform picker, which beats any custom
// listbox for a catalog of dozens of exercises. Styled with tokens only.
function ExerciseSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Exercise[]
  onChange: (id: string) => void
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        className="h-11 w-full min-w-0 appearance-none truncate rounded-md border border-border bg-surface-2 pr-10 pl-3 text-body text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((exercise) => (
          <option key={exercise.id} value={exercise.id}>
            {exercise.name}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  )
}

function RepInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <input
      aria-label={label}
      className="h-11 min-w-0 flex-1 rounded-md border border-border bg-surface-2 px-3 text-center font-mono text-body tabular-nums outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
      inputMode="numeric"
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
    />
  )
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-muted-foreground transition-colors hover:text-foreground active:translate-y-px disabled:text-disabled"
    >
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-caption font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
