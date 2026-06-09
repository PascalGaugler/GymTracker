import type { ParseKeys } from "i18next"
import { Ruler } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MeasurementQuickAdd } from "@/features/measurements/components/MeasurementQuickAdd"
import { EmptyState } from "@/pages/EmptyState"

import type { ComparisonType } from "../body"
import { useBodyData } from "../hooks/useBodyData"
import { trendDir } from "../stats"
import { BodyweightChart } from "./BodyweightChart"
import { MeasurementComparisonChart } from "./MeasurementComparisonChart"
import { StatCard } from "./StatCard"
import { TrendBadge } from "./TrendBadge"

// Rates within ±this (kg/week) read as "flat" rather than up/down noise.
const RATE_EPSILON = 0.05

// Legend swatch colours mirror MeasurementComparisonChart's series.
const LEGEND: { key: ComparisonType; color: string; labelKey: ParseKeys }[] = [
  { key: "waist", color: "var(--chart-5)", labelKey: "measurements.types.waist" },
  { key: "chest", color: "var(--chart-1)", labelKey: "measurements.types.chest" },
  { key: "biceps", color: "var(--chart-3)", labelKey: "measurements.types.biceps" },
]

// Explicit-sign value with a proper minus glyph, e.g. "−1.4 kg".
function signed(value: number, unit: string, digits = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : ""
  return `${sign}${Math.abs(value).toFixed(digits)} ${unit}`
}

// The bodyweight rate readout, reusing the dashboard StatCard/TrendBadge: latest
// weight, weekly rate badge (down is the desirable direction in a cut), and the
// total change since tracking began.
function RateCard({
  latest,
  unit,
  ratePerWeek,
  changeSinceStart,
}: {
  latest: number
  unit: string
  ratePerWeek: number | null
  changeSinceStart: number | null
}) {
  const { t } = useTranslation()

  const badge =
    ratePerWeek != null ? (
      <TrendBadge dir={trendDir(ratePerWeek, RATE_EPSILON)} good={ratePerWeek <= 0}>
        {t("dashboard.ratePerWeek", { value: Math.abs(ratePerWeek).toFixed(2), unit })}
      </TrendBadge>
    ) : undefined

  const sub =
    changeSinceStart != null && changeSinceStart !== 0
      ? t("dashboard.sinceStart", { value: signed(changeSinceStart, unit) })
      : undefined

  return (
    <StatCard
      label={t("dashboard.cards.bodyweight")}
      value={latest.toFixed(1)}
      unit={unit}
      badge={badge}
      sub={sub}
    />
  )
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className="size-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
      <span className="truncate text-caption text-muted-foreground">{label}</span>
    </span>
  )
}

// Body view (/progress/body): the smoothed bodyweight trend with its kg/week rate
// and the circumference comparison (waist vs. muscle). Empty until there is at
// least one measurement; the quick-add sheet is the launch point either way.
export function BodyView() {
  const { t } = useTranslation()
  const data = useBodyData()

  if (data === undefined) return null

  const { trend, comparison } = data
  const hasComparison = comparison.present.waist || comparison.present.chest || comparison.present.biceps

  if (trend.count === 0 && !hasComparison) {
    return (
      <EmptyState title={t("progress.body.empty.title")} body={t("progress.body.empty.body")}>
        <MeasurementQuickAdd>
          <Button variant="outline" className="h-12 text-body-lg">
            <Ruler aria-hidden="true" />
            {t("measurements.quickAdd")}
          </Button>
        </MeasurementQuickAdd>
      </EmptyState>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {trend.latest != null && (
        <>
          <RateCard
            latest={trend.latest}
            unit={trend.unit}
            ratePerWeek={trend.ratePerWeek}
            changeSinceStart={trend.changeSinceStart}
          />
          <Card className="gap-4 p-4">
            <p className="text-caption text-muted-foreground">{t("progress.body.weight.caption")}</p>
            <BodyweightChart trend={trend} />
          </Card>
        </>
      )}

      {hasComparison && (
        <Card className="gap-4 p-4">
          <p className="text-caption text-muted-foreground">
            {t("progress.body.comparison.caption")}
          </p>
          <MeasurementComparisonChart data={comparison} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGEND.filter((s) => comparison.present[s.key]).map((s) => (
              <Swatch key={s.key} color={s.color} label={t(s.labelKey)} />
            ))}
          </div>
        </Card>
      )}

      <MeasurementQuickAdd>
        <Button variant="outline" className="mt-2 h-12 w-full text-body-lg">
          <Ruler aria-hidden="true" />
          {t("measurements.quickAdd")}
        </Button>
      </MeasurementQuickAdd>
    </div>
  )
}
