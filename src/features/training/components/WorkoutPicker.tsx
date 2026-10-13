import { ChevronRight } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Overline } from "@/components/ui/overline"
import { useSelectedDay } from "@/features/day/useSelectedDay"
import { formatDayShort } from "@/lib/format"
import { EmptyState } from "@/pages/EmptyState"
import { PageHeader } from "@/pages/PageHeader"
import { cn } from "@/lib/utils"

import { useExerciseCatalog } from "../hooks/useExerciseCatalog"
import { useWorkoutRotation } from "../hooks/useWorkoutRotation"

const CHIP_LIMIT = 3

// Only the workout travels via router state; the draft is persisted on save and the form reads the selected day from context.
export function WorkoutPicker() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { day, isToday } = useSelectedDay()
  const rotation = useWorkoutRotation(isToday ? undefined : day)
  const catalog = useExerciseCatalog()

  if (rotation === undefined || catalog === undefined) return null

  const { workouts, nextWorkoutId } = rotation
  if (workouts.length === 0) {
    return (
      <>
        <PageHeader overline={t("nav.log")} title={t("log.pick.title")} />
        <EmptyState title={t("log.empty.title")} body={t("log.empty.body")} />
      </>
    )
  }

  const ordered = [...workouts].sort((a, b) => {
    if (a.id === nextWorkoutId) return -1
    if (b.id === nextWorkoutId) return 1
    return a.order - b.order
  })
  const next = workouts.find((w) => w.id === nextWorkoutId)

  function start(workoutId: string) {
    navigate(`/log/${crypto.randomUUID()}`, { state: { workoutId } })
  }

  return (
    <>
      <PageHeader
        overline={
          isToday
            ? t("log.pick.subtitle", { total: workouts.length })
            : t("day.backfill", { date: formatDayShort(day) })
        }
        title={t("log.pick.title")}
      />

      {next && (
        <p className="mb-4 text-caption text-muted-foreground">
          <Trans
            i18nKey="log.pick.hint"
            values={{ name: next.name }}
            components={{ strong: <strong className="font-semibold text-foreground" /> }}
          />
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {ordered.map((w) => {
          const isNext = w.id === nextWorkoutId
          const totalSets = w.exercises.reduce((sum, e) => sum + e.targetSets, 0)
          const names = w.exercises.map((e) => catalog.get(e.exerciseId)?.name ?? "?")
          return (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => start(w.id)}
                className={cn(
                  "w-full rounded-lg border p-4 text-left shadow-card transition-colors active:bg-surface-2",
                  isNext
                    ? "border-primary bg-surface-primary"
                    : "border-border bg-surface hover:border-border-strong",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                  <div className="min-w-0">
                    <Overline className="whitespace-nowrap">
                      {t("log.rotation", { n: w.order + 1, total: workouts.length })}
                    </Overline>
                    <div className="mt-0.5 text-h2">{w.name}</div>
                  </div>
                  {isNext ? (
                    <Badge variant="status">{t("log.pick.next")}</Badge>
                  ) : (
                    <ChevronRight className="size-5 shrink-0 text-subtle" aria-hidden="true" />
                  )}
                </div>

                <div className="mt-2 font-mono text-micro tracking-normal text-subtle">
                  {t("log.summary", { exercises: w.exercises.length, sets: totalSets })}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {names.slice(0, CHIP_LIMIT).map((name, i) => (
                    <Badge key={i}>{name}</Badge>
                  ))}
                  {names.length > CHIP_LIMIT && (
                    <Badge variant="more">+{names.length - CHIP_LIMIT}</Badge>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
