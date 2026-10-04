import { format } from "date-fns"
import { de } from "date-fns/locale"
import { useTranslation } from "react-i18next"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { RecompositionData } from "../recomposition"
import { TooltipSwatch } from "./ChartSwatches"
import { SERIES_CUES, lineWidth, markerDot } from "./chartCues"

const STRENGTH = "var(--recomp-strength)" // blue, solid — holds / rises
const BODYWEIGHT = "var(--recomp-bodyweight)" // violet, dashed — trends down

const STRENGTH_CUE = SERIES_CUES[0]! // solid · circle
const BODYWEIGHT_CUE = SERIES_CUES[1]! // dashed · square

const axisTick = {
  fill: "var(--subtle)",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
} as const

function formatDate(t: number): string {
  return format(t, "d. MMM", { locale: de })
}

// The fields we read off Recharts' injected tooltip props (kept minimal +
// optional so the element form type-checks across Recharts' tooltip generics).
interface ChartTooltipProps {
  active?: boolean
  label?: number | string
  payload?: { dataKey?: string | number; value?: number | null; color?: string }[]
}

// Tooltip matching the design-reference popover: date header + a coloured row
// per present series. Reads the merged row's own values so each series shows the
// value at its real data point.
function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  const { t } = useTranslation()
  if (!active || !payload || payload.length === 0) return null

  const rows = payload.filter((entry) => entry.value != null)
  if (rows.length === 0) return null

  return (
    <div className="rounded-md border border-border-strong bg-popover px-3 py-2 shadow-elev-2">
      <div className="mb-1 font-mono text-micro tracking-normal text-subtle">
        {formatDate(label as number)}
      </div>
      {rows.map((entry) => (
        <div key={String(entry.dataKey)} className="flex items-center gap-2">
          <TooltipSwatch
            cue={entry.dataKey === "strength" ? STRENGTH_CUE : BODYWEIGHT_CUE}
            color={entry.color ?? STRENGTH}
          />
          <span className="flex-1 text-caption text-muted-foreground">
            {entry.dataKey === "strength"
              ? t("progress.recomposition.strengthSeries")
              : t("progress.recomposition.bodyweightSeries")}
          </span>
          <span className="font-mono text-caption font-semibold tabular-nums">
            {(entry.value as number).toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  )
}

// The hero recomposition chart: strength index and bodyweight, both indexed to
// 100 at the fixed baseline, on ONE shared axis (never dual axes). Built in
// Recharts with our tokens; nulls are bridged so each series reads as a
// continuous line across the other's dates.
export function RecompositionChart({
  data,
  height = 280,
}: {
  data: RecompositionData
  height?: number
}) {
  const { t } = useTranslation()

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data.points} margin={{ top: 16, right: 14, bottom: 4, left: -12 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={formatDate}
          tick={axisTick}
          tickMargin={8}
          minTickGap={36}
          stroke="var(--border)"
        />
        <YAxis
          domain={data.yDomain}
          ticks={data.yTicks}
          tick={axisTick}
          width={36}
          stroke="var(--border)"
        />
        <ReferenceLine
          y={100}
          stroke="var(--border-strong)"
          strokeDasharray="2 4"
          label={{
            value: t("progress.recomposition.baseline"),
            position: "insideTopRight",
            fill: "var(--subtle)",
            fontSize: 9,
            fontFamily: "var(--font-mono)",
          }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border-strong)" }} />
        <Line
          type="stepAfter"
          dataKey="strength"
          name={t("progress.recomposition.strengthSeries")}
          stroke={STRENGTH}
          strokeWidth={lineWidth(STRENGTH_CUE)}
          connectNulls
          dot={markerDot(STRENGTH_CUE, STRENGTH)}
          activeDot={{ r: 5, fill: "var(--background)", stroke: STRENGTH, strokeWidth: 2.5 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="bodyweight"
          name={t("progress.recomposition.bodyweightSeries")}
          stroke={BODYWEIGHT}
          strokeWidth={lineWidth(BODYWEIGHT_CUE)}
          strokeDasharray={BODYWEIGHT_CUE.dash}
          connectNulls
          dot={markerDot(BODYWEIGHT_CUE, BODYWEIGHT)}
          activeDot={{ r: 5, fill: "var(--background)", stroke: BODYWEIGHT, strokeWidth: 2.5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
