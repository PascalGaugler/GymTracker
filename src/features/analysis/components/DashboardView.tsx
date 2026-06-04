import type { ReactNode } from "react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { useLiveQuery } from "dexie-react-hooks"
import { Ruler } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { planRepository } from "@/data/repositories"
import { MeasurementQuickAdd } from "@/features/measurements/components/MeasurementQuickAdd"
import { EmptyState } from "@/pages/EmptyState"
import { PageHeader } from "@/pages/PageHeader"

import { useMeasurementStats } from "../hooks/useMeasurementStats"
import { trendDir, type MeasurementSummary } from "../stats"
import { StatCard } from "./StatCard"
import { TodayWorkoutCard } from "./TodayWorkoutCard"
import { TrendBadge } from "./TrendBadge"

// Rates within ±this read as "flat" (kg/cm per week) rather than up/down noise.
const RATE_EPSILON = 0.05

// Explicit-sign value with a proper minus glyph, e.g. "−6.2 cm".
function signed(value: number, unit: string, digits = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : ""
  return `${sign}${Math.abs(value).toFixed(digits)} ${unit}`
}

// A live measurement card: latest value, weekly-rate trend badge, and the
// total change since tracking began. Down is the desirable direction (a cut).
function MeasurementStat({
  label,
  summary,
  loading,
}: {
  label: string
  summary: MeasurementSummary | null
  loading: boolean
}) {
  const { t } = useTranslation()

  if (loading) return <StatCard label={label} value={null} />
  if (!summary) return <StatCard label={label} value={null} sub={t("dashboard.cards.noData")} />

  const { latest, unit, ratePerWeek, changeSinceStart, count } = summary

  const badge =
    ratePerWeek != null ? (
      <TrendBadge dir={trendDir(ratePerWeek, RATE_EPSILON)} good={ratePerWeek <= 0}>
        {t("dashboard.ratePerWeek", { value: Math.abs(ratePerWeek).toFixed(2), unit })}
      </TrendBadge>
    ) : undefined

  const sub =
    count > 1 && changeSinceStart !== 0
      ? t("dashboard.sinceStart", { value: signed(changeSinceStart, unit) })
      : undefined

  return <StatCard label={label} value={latest.toFixed(1)} unit={unit} badge={badge} sub={sub} />
}

// Neutral "not yet" pill for the cards whose data lands in a later phase.
function SoonPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-surface-2 px-2.5 py-1 font-mono text-micro font-semibold tracking-normal text-subtle">
      {children}
    </span>
  )
}

// The dashboard: headline stat cards + quick actions. Strength index and
// calories are placeholders (their math/integration arrive in P5 and Phase 2).
export function DashboardView() {
  const { t } = useTranslation()
  const plans = useLiveQuery(() => planRepository.getAll(), [])
  const stats = useMeasurementStats()
  const today = format(new Date(), "EEEE · d. MMMM", { locale: de })

  if (plans === undefined) return null

  if (plans.length === 0) {
    return (
      <>
        <PageHeader overline={today} title={t("dashboard.title")} />
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

  return (
    <>
      <PageHeader overline={today} title={t("dashboard.title")} />

      <div className="grid grid-cols-2 gap-3">
        <MeasurementStat
          label={t("dashboard.cards.bodyweight")}
          summary={stats?.bodyweight ?? null}
          loading={loading}
        />
        <MeasurementStat
          label={t("dashboard.cards.waist")}
          summary={stats?.waist ?? null}
          loading={loading}
        />
        <StatCard
          label={t("dashboard.cards.strength")}
          value={null}
          muted
          badge={<SoonPill>{t("dashboard.cards.soon")}</SoonPill>}
          sub={t("dashboard.cards.strengthSoon")}
        />
        <StatCard
          label={t("dashboard.cards.calories")}
          value={null}
          muted
          badge={<SoonPill>{t("common.phase2")}</SoonPill>}
          sub={t("dashboard.cards.caloriesSoon")}
        />
      </div>

      <TodayWorkoutCard />

      <MeasurementQuickAdd>
        <Button variant="outline" className="mt-6 h-12 w-full text-body-lg">
          <Ruler aria-hidden="true" />
          {t("measurements.quickAdd")}
        </Button>
      </MeasurementQuickAdd>
    </>
  )
}
