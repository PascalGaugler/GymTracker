import { useTranslation } from "react-i18next"

import { Card } from "@/components/ui/card"
import { formatSigned } from "@/lib/format"
import { EmptyState } from "@/pages/EmptyState"

import { recompositionInsight } from "../insights"
import { useRecompositionData } from "../hooks/useRecompositionData"
import { LegendSwatch } from "./ChartSwatches"
import { SERIES_CUES } from "./chartCues"
import { Insight } from "./Insight"
import { RecompositionChart } from "./RecompositionChart"
import { TrendBadge } from "./TrendBadge"

// The recomposition (hero) view: the indexed strength-vs-bodyweight chart with a
// legend and a one-line read of the thesis. Empty until there is something to
// index (a logged session or a weigh-in).
export function RecompositionView() {
  const { t } = useTranslation()
  const data = useRecompositionData()

  if (data === undefined) return null

  if (!data.hasStrength && !data.hasBodyweight) {
    return (
      <EmptyState
        title={t("progress.recomposition.empty.title")}
        body={t("progress.recomposition.empty.body")}
      />
    )
  }

  // Change since the FIXED baseline (both indices are 100 there); null = no data.
  const strengthDelta = data.latestStrengthIndex == null ? null : data.latestStrengthIndex - 100
  const weightDelta = data.latestBodyweightIndex == null ? null : data.latestBodyweightIndex - 100
  const insight = recompositionInsight(strengthDelta, weightDelta)
  const params = {
    strength: formatSigned(strengthDelta ?? 0, 1),
    weight: formatSigned(weightDelta ?? 0, 1),
  }

  return (
    <Card className="gap-3.5 px-3.5 pt-4.5 pb-4">
      <p className="font-mono text-micro tracking-normal text-subtle">
        {t("progress.recomposition.caption")}
      </p>

      <RecompositionChart data={data} />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <LegendSwatch
          cue={SERIES_CUES[0]!}
          color="var(--recomp-strength)"
          label={t("progress.recomposition.strengthSeries")}
        />
        <LegendSwatch
          cue={SERIES_CUES[1]!}
          color="var(--recomp-bodyweight)"
          label={t("progress.recomposition.bodyweightSeries")}
        />
      </div>

      <Insight
        badge={
          insight.badge && (
            <TrendBadge dir={insight.badge.dir} good={insight.badge.good}>
              {t(insight.badge.labelKey)}
            </TrendBadge>
          )
        }
      >
        {t(insight.textKey, params)}
      </Insight>
    </Card>
  )
}
