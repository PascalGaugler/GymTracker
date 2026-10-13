import type { ComponentProps } from "react"
import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { addDays } from "date-fns"
import { CalendarDays, Ruler } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { pickChipVariants } from "@/components/ui/segmented"
import { planRepository } from "@/data/repositories"
import { dayKey } from "@/features/day/day"
import { DayCalendarSheet } from "@/features/day/components/DayCalendarSheet"
import { useDaySwipe } from "@/features/day/hooks/useDaySwipe"
import { useSelectedDay } from "@/features/day/useSelectedDay"
import { MeasurementQuickAdd } from "@/features/measurements/components/MeasurementQuickAdd"
import { formatDayLong, formatDecimal, formatSigned } from "@/lib/format"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/pages/EmptyState"
import { PageHeader } from "@/pages/PageHeader"

import { useMeasurementStats } from "../hooks/useMeasurementStats"
import type { GoalProgress } from "../goal"
import { useStrengthIndex } from "../hooks/useStrengthIndex"
import { BASELINE_INDEX } from "../recomposition"
import { trendDir, type MeasurementSummary } from "../stats"
import { RecompositionPreview } from "./RecompositionPreview"
import { StatCard } from "./StatCard"
import { TodayWorkoutCard } from "./TodayWorkoutCard"
import { TrendBadge } from "./TrendBadge"

const RATE_EPSILON = 0.05

function MeasurementStat({
  label,
  summary,
  loading,
  action,
  goal,
  day,
}: {
  label: string
  summary: MeasurementSummary | null
  loading: boolean
  /** Makes the card interactive: a route link, or (no `to`) a quick-add trigger. */
  action: { actionHint: string; to?: string }
  goal?: GoalProgress | null
  /** Quick-add trigger only: the day it writes to. */
  day: Date
}) {
  const { t } = useTranslation()
  const card = (props: Omit<ComponentProps<typeof StatCard>, "label" | "to" | "actionHint">) => {
    const el = <StatCard label={label} to={action.to} actionHint={action.actionHint} {...props} />
    return action.to ? el : <MeasurementQuickAdd day={day}>{el}</MeasurementQuickAdd>
  }

  if (loading) return card({ value: null })
  if (!summary) return card({ value: null, sub: t("dashboard.cards.noData") })

  const { latest, unit, ratePerWeek, changeSinceStart, count } = summary

  const badge =
    ratePerWeek != null ? (
      <TrendBadge dir={trendDir(ratePerWeek, RATE_EPSILON)} good={ratePerWeek <= 0}>
        {t("dashboard.ratePerWeek", { value: Math.abs(ratePerWeek).toFixed(2), unit })}
      </TrendBadge>
    ) : undefined

  const sub =
    count > 1 && changeSinceStart !== 0
      ? t("dashboard.sinceStart", { value: `${formatSigned(changeSinceStart, 1)} ${unit}` })
      : undefined

  const goalProp = goal
    ? {
        progress: goal.progress,
        startLabel: t("dashboard.cards.goalStart", { value: formatDecimal(goal.start, 2) }),
        targetLabel: t("dashboard.cards.goalTarget", { value: formatDecimal(goal.target, 2) }),
        spoken: t("dashboard.cards.goalSpoken", {
          target: formatDecimal(goal.target, 2),
          percent: Math.round(goal.progress * 100),
        }),
      }
    : undefined

  return card({ value: latest.toFixed(1), unit, badge, sub, goal: goalProp })
}

const INDEX_EPSILON = 0.5

function StrengthStat({ day }: { day: Date }) {
  const { t } = useTranslation()
  const strength = useStrengthIndex(day)

  const link = {
    label: t("dashboard.cards.strength"),
    to: "/progress/recomposition",
    actionHint: t("dashboard.cards.strengthOpen"),
  }

  if (strength === undefined) return <StatCard {...link} value={null} />
  if (strength === null)
    return <StatCard {...link} value={null} sub={t("dashboard.cards.noData")} />

  const delta = strength.latest - BASELINE_INDEX
  const badge = (
    <TrendBadge dir={trendDir(delta, INDEX_EPSILON)} good={delta >= 0}>
      {formatSigned(delta, 1)}
    </TrendBadge>
  )

  return (
    <StatCard
      {...link}
      value={strength.latest.toFixed(1)}
      badge={badge}
      sub={t("dashboard.cards.strengthBaseline", { value: formatSigned(delta, 1) })}
    />
  )
}

export function DashboardView() {
  const { t } = useTranslation()
  const plans = useLiveQuery(() => planRepository.getAll(), [])
  const { day, isToday, shiftDay, goToToday } = useSelectedDay()
  const stats = useMeasurementStats(day)
  const [calendarOpen, setCalendarOpen] = useState(false)
  // Set only when a swipe caused the day change, keyed to its target day; any other change just fades.
  const [slide, setSlide] = useState<{ key: string; from: "left" | "right" } | null>(null)

  const swipe = useDaySwipe({
    onSwipeRight: () => {
      const target = addDays(day, -1)
      setSlide({ key: dayKey(target), from: "left" })
      shiftDay(-1)
    },
    // No-op on today so nothing remounts/animates.
    onSwipeLeft: () => {
      if (isToday) return
      const target = addDays(day, 1)
      setSlide({ key: dayKey(target), from: "right" })
      shiftDay(1)
    },
  })

  const overline = formatDayLong(day)

  if (plans === undefined) return null

  if (plans.length === 0) {
    return (
      <>
        <PageHeader overline={overline} title={t("dashboard.title")} />
        <EmptyState
          title={t("dashboard.empty.title")}
          body={t("dashboard.empty.body")}
          steps={[
            t("dashboard.empty.steps.plan"),
            t("dashboard.empty.steps.exercises"),
            t("dashboard.empty.steps.session"),
          ]}
        />
      </>
    )
  }

  const loading = stats === undefined

  // Keyed by day to remount and replay the slide, only for swipe-caused transitions.
  const slideClass =
    slide?.key === dayKey(day)
      ? slide.from === "left"
        ? "slide-in-from-left-4"
        : "slide-in-from-right-4"
      : ""

  return (
    <>
      <PageHeader
        overline={overline}
        title={t("dashboard.title")}
        action={
          <>
            {!isToday && (
              <button
                type="button"
                onClick={goToToday}
                className={cn(pickChipVariants({ active: false }))}
              >
                {t("day.today")}
              </button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("day.openCalendar")}
              onClick={() => setCalendarOpen(true)}
            >
              <CalendarDays aria-hidden="true" />
            </Button>
          </>
        }
      />

      <div
        key={dayKey(day)}
        onTouchStart={swipe.onTouchStart}
        onTouchEnd={swipe.onTouchEnd}
        className={cn("animate-in fade-in duration-(--dur) motion-reduce:animate-none", slideClass)}
      >
        <div className="grid grid-cols-2 gap-3">
          <MeasurementStat
            label={t("dashboard.cards.bodyweight")}
            summary={stats?.bodyweight ?? null}
            loading={loading}
            goal={stats?.bodyweightGoal}
            action={{ actionHint: t("dashboard.cards.bodyweightAdd") }}
            day={day}
          />
          <MeasurementStat
            label={t("dashboard.cards.waist")}
            summary={stats?.waist ?? null}
            loading={loading}
            action={{ to: "/progress/body", actionHint: t("dashboard.cards.waistOpen") }}
            day={day}
          />
          <StrengthStat day={day} />
          <StatCard
            label={t("dashboard.cards.calories")}
            value={null}
            muted
            badge={<Badge variant="neutral">{t("dashboard.cards.soon")}</Badge>}
            sub={t("dashboard.cards.caloriesSoon")}
          />
        </div>

        <RecompositionPreview />

        <TodayWorkoutCard />

        <MeasurementQuickAdd day={day}>
          <Button variant="outline" size="lg" className="mt-3 w-full">
            <Ruler aria-hidden="true" />
            {t("measurements.quickAdd")}
          </Button>
        </MeasurementQuickAdd>
      </div>

      <DayCalendarSheet open={calendarOpen} onOpenChange={setCalendarOpen} />
    </>
  )
}
