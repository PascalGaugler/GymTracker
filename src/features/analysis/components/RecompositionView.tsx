import { useTranslation } from "react-i18next"

import { Card } from "@/components/ui/card"
import { EmptyState } from "@/pages/EmptyState"

import { useRecompositionData } from "../hooks/useRecompositionData"
import { RecompositionChart } from "./RecompositionChart"

// Legend swatch: a short line stub coloured (and dashed) like its series.
function Swatch({ color, dashed, label }: { color: string; dashed?: boolean; label: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span
        className="h-0.5 w-5 shrink-0 rounded-full"
        style={
          dashed
            ? { backgroundImage: `repeating-linear-gradient(to right, ${color} 0 5px, transparent 5px 9px)` }
            : { background: color }
        }
        aria-hidden="true"
      />
      <span className="truncate text-caption text-muted-foreground">{label}</span>
    </span>
  )
}

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

  return (
    <Card className="gap-4 p-4">
      <p className="text-caption text-muted-foreground">{t("progress.recomposition.caption")}</p>

      <RecompositionChart data={data} />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Swatch
          color="var(--recomp-strength)"
          label={t("progress.recomposition.strengthSeries")}
        />
        <Swatch
          color="var(--recomp-bodyweight)"
          dashed
          label={t("progress.recomposition.bodyweightSeries")}
        />
      </div>
    </Card>
  )
}
