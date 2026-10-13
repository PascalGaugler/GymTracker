import { useTranslation } from "react-i18next"
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { BodyweightPoint, BodyweightTrend } from "../body"
import { ChartTooltipFrame, ChartTooltipRow } from "./ChartTooltip"
import { axisTick, formatDate } from "./chartFormat"

const RAW = "var(--subtle)"
const TREND = "var(--recomp-bodyweight)"

interface ChartTooltipProps {
  active?: boolean
  payload?: { payload?: BodyweightPoint }[]
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
        sub
        label={t("progress.body.weight.raw")}
        value={row.raw.toFixed(1)}
        unit={unit}
      />
      <ChartTooltipRow
        label={t("progress.body.weight.trend")}
        value={row.ma.toFixed(1)}
        unit={unit}
      />
    </ChartTooltipFrame>
  )
}

export function BodyweightChart({ trend }: { trend: BodyweightTrend }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={trend.points} margin={{ top: 16, right: 14, bottom: 4, left: -12 }}>
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
          domain={trend.yDomain}
          ticks={trend.yTicks}
          tick={axisTick}
          width={36}
          stroke="var(--border)"
        />
        <Tooltip
          content={<ChartTooltip unit={trend.unit} />}
          cursor={{ stroke: "var(--border-strong)" }}
        />
        <Line
          dataKey="raw"
          stroke="none"
          dot={{ r: 2.2, fill: RAW, strokeWidth: 0 }}
          activeDot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="ma"
          stroke={TREND}
          strokeWidth={2.6}
          dot={false}
          activeDot={{ r: 5, fill: "var(--background)", stroke: TREND, strokeWidth: 2.5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
