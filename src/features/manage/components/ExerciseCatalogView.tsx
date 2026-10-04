import { useState } from "react"
import type { ParseKeys } from "i18next"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Exercise } from "@/data/schema"
import { EmptyState } from "@/pages/EmptyState"

import { useExerciseList } from "../hooks/useExerciseList"
import { ExerciseEditorDialog } from "./ExerciseEditorDialog"

const TYPE_LABEL: Record<Exercise["type"], ParseKeys> = {
  barbell: "manage.exercises.types.barbell",
  dumbbell: "manage.exercises.types.dumbbell",
  machine: "manage.exercises.types.machine",
  cable: "manage.exercises.types.cable",
  bodyweight: "manage.exercises.types.bodyweight",
}

export function ExerciseCatalogView() {
  const { t } = useTranslation()
  const [query, setQuery] = useState("")
  const exercises = useExerciseList(query)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [open, setOpen] = useState(false)

  function openEditor(exercise: Exercise | null) {
    setEditing(exercise)
    setOpen(true)
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <Input
          className="flex-1"
          value={query}
          placeholder={t("manage.exercises.search")}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          className="shrink-0"
          size="icon"
          aria-label={t("manage.exercises.add")}
          onClick={() => openEditor(null)}
        >
          <Plus className="size-5" />
        </Button>
      </div>

      {exercises && exercises.length > 0 && (
        <p className="mb-3 font-mono text-caption text-muted-foreground">
          {t("manage.exercises.count", { count: exercises.length })}
        </p>
      )}

      {exercises?.length === 0 &&
        (query.trim() ? (
          <p className="rounded-lg border border-dashed border-border bg-surface/40 p-6 text-center text-body text-muted-foreground">
            {t("manage.exercises.noResults", { query: query.trim() })}
          </p>
        ) : (
          <EmptyState
            title={t("manage.exercises.empty.title")}
            body={t("manage.exercises.empty.body")}
          >
            <Button onClick={() => openEditor(null)}>
              <Plus className="size-4" />
              {t("manage.exercises.add")}
            </Button>
          </EmptyState>
        ))}

      <ul className="flex flex-col gap-2">
        {exercises?.map((exercise) => (
          <li key={exercise.id}>
            <button
              type="button"
              onClick={() => openEditor(exercise)}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left shadow-card transition-colors hover:border-border-strong"
            >
              <span className="min-w-0 flex-1 line-clamp-2 wrap-break-word text-body font-medium">
                {exercise.name}
              </span>
              <Badge>{t(TYPE_LABEL[exercise.type])}</Badge>
              <span className="shrink-0 font-mono text-caption text-subtle">{exercise.unit}</span>
            </button>
          </li>
        ))}
      </ul>

      <ExerciseEditorDialog exercise={editing} open={open} onOpenChange={setOpen} />
    </>
  )
}
