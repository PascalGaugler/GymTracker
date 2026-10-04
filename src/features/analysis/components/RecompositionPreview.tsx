import { ChevronRight } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Overline } from "@/components/ui/overline"
import { formatSigned } from "@/lib/format"

import { useRecompositionData } from "../hooks/useRecompositionData"
import { BASELINE_INDEX } from "../recomposition"
import { RecompositionChart } from "./RecompositionChart"

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

// Dashboard "am I on track?" preview: the thesis in one line plus a mini
// recomposition chart, linking to the full view. Renders nothing until BOTH
// series have a fixed baseline (the comparison is meaningless with only one).
export function RecompositionPreview() {
  const { t } = useTranslation()
  const data = useRecompositionData()

  if (
    data === undefined ||
    data.latestStrengthIndex == null ||
    data.latestBodyweightIndex == null ||
    data.points.length < 2
  ) {
    return null
  }

  const span = data.points[data.points.length - 1].t - data.points[0].t
  const weeks = Math.max(1, Math.round(span / WEEK_MS))

  return (
    <Link
      to="/progress/recomposition"
      className="mt-3.5 block rounded-lg border border-border bg-surface px-4 pt-4 pb-2 shadow-card transition-transform duration-(--dur-fast) active:scale-99"
    >
      <div className="flex items-center justify-between gap-2">
        <Overline tone="primary">{t("progress.tabs.recomposition")}</Overline>
        <span className="flex items-center text-caption text-muted-foreground">
          {t("dashboard.recomposition.open")}
          <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 mb-1.5 text-body">
        <Trans
          i18nKey="dashboard.recomposition.thesis"
          count={weeks}
          values={{
            strength: formatSigned(data.latestStrengthIndex - BASELINE_INDEX, 1),
            weight: formatSigned(data.latestBodyweightIndex - BASELINE_INDEX, 1),
          }}
          components={{
            strength: <strong className="font-semibold text-recomp-strength" />,
            weight: <strong className="font-semibold text-recomp-bodyweight" />,
          }}
        />
      </p>
      {/* Decorative: pointer-events off so touches scroll the page / hit the link. */}
      <div className="pointer-events-none -mx-1" aria-hidden="true">
        <RecompositionChart data={data} height={150} />
      </div>
    </Link>
  )
}
