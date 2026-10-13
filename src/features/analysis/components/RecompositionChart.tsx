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

import type { RecompositionData, RecompositionPoint } from "../recomposition"
import { ChartTooltipFrame, ChartTooltipRow } from "./ChartTooltip"
import { SERIES_CUES, lineWidth, markerDot } from "./chartCues"
import { axisTick, formatDate } from "./chartFormat"

const STRENGTH = "var(--recomp-strength)"
const BODYWEIGHT = "var(--recomp-bodyweight)"

// Charts at or below this height are the Dashboard preview.
const COMPACT_MAX_HEIGHT = 200

const STRENGTH_CUE = SERIES_CUES[0]!
const BODYWEIGHT_CUE = SERIES_CUES[1]!

// ~90 daily weigh-ins would fuse into a band: mark only every Nth point + the last.
const MARKER_EVERY = 8
const drawBodyweightMarker = markerDot(BODYWEIGHT_CUE, BODYWEIGHT)

// Minimal/optional so the element form type-checks across Recharts' tooltip generics.
interface ChartTooltipProps {
  active?: boolean
  label?: number | string
  payload?: { payload?: RecompositionPoint }[]
}

// Rows are forward-filled, so a weigh-in-only or session-only date still shows both series.
function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  const { t } = useTranslation()
  if (!active || !payload || payload.length === 0) return null
  const row = payload[0]?.payload
  if (!row) return null
  if (row.strengthDisplayAsOf == null && row.bodyweightAsOf == null) return null

  return (
    <ChartTooltipFrame title={formatDate(label as number)}>
      {row.strengthDisplayAsOf != null && (
        <>
          <ChartTooltipRow
            cue={STRENGTH_CUE}
            color={STRENGTH}
            label={t("progress.recomposition.strengthSmoothed")}
            value={row.strengthDisplayAsOf.toFixed(1)}
          />
          {row.strengthAsOf != null && (
            <ChartTooltipRow
              sub
              indent
              label={t("progress.recomposition.strengthRaw")}
              value={row.strengthAsOf.toFixed(1)}
            />
          )}
        </>
      )}
      {row.bodyweightAsOf != null && (
        <ChartTooltipRow
          cue={BODYWEIGHT_CUE}
          color={BODYWEIGHT}
          label={t("progress.recomposition.bodyweightSeries")}
          value={row.bodyweightAsOf.toFixed(1)}
        />
      )}
    </ChartTooltipFrame>
  )
}

// ONE shared axis (never dual); connectNulls bridges each series across the other's dates.
export function RecompositionChart({
  data,
  height = 280,
}: {
  data: RecompositionData
  height?: number
}) {
  const { t } = useTranslation()
  const lastIndex = data.points.length - 1
  const bodyweightDot = (props: { cx?: number; cy?: number; index?: number }) =>
    props.index != null && (props.index % MARKER_EVERY === 0 || props.index === lastIndex) ? (
      drawBodyweightMarker(props)
    ) : (
      <g key={props.index} />
    )
  const compact = height <= COMPACT_MAX_HEIGHT

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
            position: "insideBottomRight",
            dy: -4,
            fill: "var(--subtle)",
            fontSize: 9,
            fontFamily: "var(--font-mono)",
          }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border-strong)" }} />
        <Line
          type="stepAfter"
          dataKey="strengthDisplay"
          name={t("progress.recomposition.strengthSeries")}
          stroke={STRENGTH}
          strokeWidth={lineWidth(STRENGTH_CUE)}
          connectNulls
          dot={false}
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
          dot={compact ? false : bodyweightDot}
          activeDot={{ r: 5, fill: "var(--background)", stroke: BODYWEIGHT, strokeWidth: 2.5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
