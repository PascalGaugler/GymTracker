import { format } from "date-fns"
import { de } from "date-fns/locale"
import { useLiveQuery } from "dexie-react-hooks"
import { Ruler } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { planRepository } from "@/data/repositories"
import { MeasurementQuickAdd } from "@/features/measurements/components/MeasurementQuickAdd"
import { formatSigned } from "@/lib/format"
import { EmptyState } from "@/pages/EmptyState"
import { PageHeader } from "@/pages/PageHeader"

import { useMeasurementStats } from "../hooks/useMeasurementStats"
import { useStrengthIndex } from "../hooks/useStrengthIndex"
import { BASELINE_INDEX } from "../recomposition"
import { trendDir, type MeasurementSummary } from "../stats"
import { StatCard } from "./StatCard"
import { TodayWorkoutCard } from "./TodayWorkoutCard"
import { TrendBadge } from "./TrendBadge"

// Rates within ±this read as "flat" (kg/cm per week) rather than up/down noise.
const RATE_EPSILON = 0.05

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
      ? t("dashboard.sinceStart", { value: `${formatSigned(changeSinceStart, 1)} ${unit}` })
      : undefined

  return <StatCard label={label} value={latest.toFixed(1)} unit={unit} badge={badge} sub={sub} />
}

// Index moves within ±this read as "flat" rather than up/down noise.
const INDEX_EPSILON = 0.5

// Live strength-index card: latest index (100 = baseline) with the change since
// baseline. Up is the desirable direction (strength holding/rising during a cut).
function StrengthStat() {
  const { t } = useTranslation()
  const strength = useStrengthIndex()

  if (strength === undefined) return <StatCard label={t("dashboard.cards.strength")} value={null} />
  if (strength === null)
    return (
      <StatCard
        label={t("dashboard.cards.strength")}
        value={null}
        sub={t("dashboard.cards.noData")}
      />
    )

  const delta = strength.latest - BASELINE_INDEX
  const badge = (
    <TrendBadge dir={trendDir(delta, INDEX_EPSILON)} good={delta >= 0}>
      {formatSigned(delta, 1)}
    </TrendBadge>
  )

  return (
    <StatCard
      label={t("dashboard.cards.strength")}
      value={strength.latest.toFixed(1)}
      badge={badge}
      sub={t("dashboard.cards.strengthBaseline")}
    />
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
        <StrengthStat />
        <StatCard
          label={t("dashboard.cards.calories")}
          value={null}
          muted
          badge={<Badge variant="neutral">{t("dashboard.cards.soon")}</Badge>}
          sub={t("dashboard.cards.caloriesSoon")}
        />
      </div>

      <TodayWorkoutCard />

      <MeasurementQuickAdd>
        <Button variant="outline" size="lg" className="mt-3 w-full">
          <Ruler aria-hidden="true" />
          {t("measurements.quickAdd")}
        </Button>
      </MeasurementQuickAdd>
    </>
  )
}
