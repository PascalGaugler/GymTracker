import type { ReactNode } from "react"
import { Check, ChevronRight, Dumbbell } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Overline } from "@/components/ui/overline"
import type { WorkoutSession } from "@/data/schema"
import { useSelectedDay } from "@/features/day/useSelectedDay"
import { useExerciseCatalog } from "@/features/training/hooks/useExerciseCatalog"
import { useSessionsOnDay, useWorkout } from "@/features/training/hooks/useSessionLog"
import { useWorkoutRotation } from "@/features/training/hooks/useWorkoutRotation"
import { sessionTally } from "@/features/training/sessionTally"
import { formatDayShort } from "@/lib/format"
import { cn } from "@/lib/utils"

const CHIP_LIMIT = 4

function ChipRow({ names }: { names: string[] }) {
  return (
    <div className="mt-3.5 flex flex-wrap gap-1.5">
      {names.slice(0, CHIP_LIMIT).map((name, i) => (
        <Badge key={i}>{name}</Badge>
      ))}
      {names.length > CHIP_LIMIT && <Badge variant="more">+{names.length - CHIP_LIMIT}</Badge>}
    </div>
  )
}

// Shared card chrome for every state below: an overline + workout name, an
// icon chip top-right, exercise chips, and a footer strip (CTA or tally).
function WorkoutCard({
  overline,
  name,
  names,
  icon,
  iconClassName,
  footer,
  footerClassName,
  onClick,
}: {
  overline: string
  name: string
  names: string[]
  icon: ReactNode
  iconClassName: string
  footer: ReactNode
  footerClassName: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-border-strong bg-linear-155 from-surface-hero to-surface to-60% p-4.5 text-left shadow-card transition-transform duration-(--dur-fast) active:scale-99"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Overline>{overline}</Overline>
          <div className="mt-0.5 text-h2 font-semibold">{name}</div>
        </div>
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-md",
            iconClassName,
          )}
        >
          {icon}
        </span>
      </div>

      <ChipRow names={names} />

      <div
        className={cn(
          "mt-3.5 flex h-12 items-center justify-center gap-2 rounded-md text-body font-semibold",
          footerClassName,
        )}
      >
        {footer}
      </div>
    </button>
  )
}

// Dashboard quick-action, day-aware:
// - the selected day already has a session → its progress (workout, a
//   done/total tally, a green check once complete); tap re-opens it via
//   `/log` (the selected day still has that session, so `/log` shows it
//   directly, no picker).
// - no session on a PAST day → a backfill suggestion (rotation computed from
//   the session before that day); tap opens the picker via `/log`.
// - no session TODAY → the original "start now" CTA, unchanged: mints a
//   fresh session id and opens it directly, bypassing the picker.
// Renders nothing while loading, or with no active plan / no workouts (the
// picker on `/log` owns that empty state).
export function TodayWorkoutCard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { day, isToday } = useSelectedDay()
  const sessionsOnDay = useSessionsOnDay(day)
  const catalog = useExerciseCatalog()
  const rotation = useWorkoutRotation(isToday ? undefined : day)

  const latest = sessionsOnDay?.reduce<WorkoutSession | undefined>(
    (latestSoFar, s) => (!latestSoFar || s.date > latestSoFar.date ? s : latestSoFar),
    undefined,
  )
  const sessionWorkout = useWorkout(latest?.workoutId)

  if (sessionsOnDay === undefined || catalog === undefined || rotation === undefined) return null

  // The day already has a session — show its progress, not a suggestion.
  if (latest) {
    if (!sessionWorkout) return null
    const { done, total } = sessionTally(latest, sessionWorkout)
    const complete = total > 0 && done === total
    const names = sessionWorkout.exercises.map((e) => catalog.get(e.exerciseId)?.name ?? "?")

    return (
      <section className="mt-6">
        <h2 className="mb-3 text-h3 font-semibold">
          {isToday
            ? t("dashboard.today.loggedTitle")
            : t("dashboard.today.loggedTitleOn", { date: formatDayShort(day) })}
        </h2>
        <WorkoutCard
          overline={t("log.summary", { exercises: sessionWorkout.exercises.length, sets: total })}
          name={sessionWorkout.name}
          names={names}
          icon={
            complete ? (
              <Check className="size-6" aria-hidden="true" />
            ) : (
              <Dumbbell className="size-6" aria-hidden="true" />
            )
          }
          iconClassName={
            complete ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
          }
          footer={
            <Badge variant={complete ? "tallyDone" : "tally"}>
              {t("log.progress", { done, total })}
            </Badge>
          }
          footerClassName="bg-surface-2"
          onClick={() => navigate("/log")}
        />
      </section>
    )
  }

  const { workouts, nextWorkoutId } = rotation
  const next = workouts.find((w) => w.id === nextWorkoutId)
  if (!next) return null
  const names = next.exercises.map((e) => catalog.get(e.exerciseId)?.name ?? "?")

  // No session on a past day: suggest the backfill via the rotation computed
  // from the session before that day; tapping opens the picker (`/log`).
  if (!isToday) {
    return (
      <section className="mt-6">
        <h2 className="mb-3 text-h3 font-semibold">
          {t("day.backfill", { date: formatDayShort(day) })}
        </h2>
        <WorkoutCard
          overline={t("log.rotation", { n: next.order + 1, total: workouts.length })}
          name={next.name}
          names={names}
          icon={<Dumbbell className="size-6" aria-hidden="true" />}
          iconClassName="bg-primary text-primary-foreground"
          footer={
            <>
              {t("dashboard.today.backfillCta")}
              <ChevronRight className="size-4" aria-hidden="true" />
            </>
          }
          footerClassName="bg-primary-soft text-primary"
          onClick={() => navigate("/log")}
        />
      </section>
    )
  }

  // No session today: the original behaviour — start logging directly.
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-h3 font-semibold">{t("dashboard.today.title")}</h2>
      <WorkoutCard
        overline={t("log.rotation", { n: next.order + 1, total: workouts.length })}
        name={next.name}
        names={names}
        icon={<Dumbbell className="size-6" aria-hidden="true" />}
        iconClassName="bg-primary text-primary-foreground"
        footer={
          <>
            {t("dashboard.today.cta")}
            <ChevronRight className="size-4" aria-hidden="true" />
          </>
        }
        footerClassName="bg-primary-soft text-primary"
        onClick={() =>
          navigate(`/log/${crypto.randomUUID()}`, { state: { workoutId: next.id, returnTo: "/" } })
        }
      />
    </section>
  )
}
