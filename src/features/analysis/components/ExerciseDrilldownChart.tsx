import { useTranslation } from "react-i18next"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { DrilldownData, DrilldownPoint } from "../exerciseDrilldown"
import { ChartTooltipFrame, ChartTooltipRow } from "./ChartTooltip"
import { SERIES_CUES, lineWidth, markerDot } from "./chartCues"
import { axisTick, formatDate } from "./chartFormat"

const LINE = "var(--chart-1)"
const CUE = SERIES_CUES[0]!
const BAND = "var(--chart-1)"

interface ChartTooltipProps {
  active?: boolean
  payload?: { payload?: DrilldownPoint }[]
  unit?: string
}

function ChartTooltip({ active, payload, unit }: ChartTooltipProps) {
  const { t } = useTranslation()
  if (!active || !payload || payload.length === 0) return null
  const row = payload[0]?.payload
  if (!row) return null

  return (
    <ChartTooltipFrame title={formatDate(row.t)}>
      <ChartTooltipRow
        cue={CUE}
        color={LINE}
        label={t("progress.exercise.topSet")}
        value={row.top.toFixed(1)}
        unit={unit}
      />
      {row.min !== row.top && (
        <ChartTooltipRow
          sub
          label={t("progress.exercise.range")}
          value={`${row.min.toFixed(1)}–${row.top.toFixed(1)}`}
        />
      )}
    </ChartTooltipFrame>
  )
}

export function ExerciseDrilldownChart({ data, unit }: { data: DrilldownData; unit: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data.points} margin={{ top: 16, right: 14, bottom: 4, left: -12 }}>
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
        <Tooltip
          content={<ChartTooltip unit={unit} />}
          cursor={{ stroke: "var(--border-strong)" }}
        />
        <Area
          type="stepAfter"
          dataKey="band"
          stroke="none"
          fill={BAND}
          fillOpacity={0.14}
          isAnimationActive={false}
          activeDot={false}
        />
        <Line
          type="stepAfter"
          dataKey="top"
          stroke={LINE}
          strokeWidth={lineWidth(CUE)}
          dot={markerDot(CUE, LINE)}
          activeDot={{ r: 5, fill: "var(--background)", stroke: LINE, strokeWidth: 2.5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
