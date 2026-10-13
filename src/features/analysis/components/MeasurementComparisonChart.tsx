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

import type { MeasurementComparison } from "../body"
import { ChartTooltipFrame, ChartTooltipRow } from "./ChartTooltip"
import { COMPARISON_SERIES, lineWidth, markerDot, SERIES_CUES } from "./chartCues"
import { axisTick, formatDate } from "./chartFormat"

interface ChartTooltipProps {
  active?: boolean
  label?: number | string
  payload?: { dataKey?: string | number; name?: string; value?: number | null; color?: string }[]
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const rows = payload.filter((entry) => entry.value != null)
  if (rows.length === 0) return null

  return (
    <ChartTooltipFrame title={formatDate(label as number)}>
      {rows.map((entry) => (
        <ChartTooltipRow
          key={String(entry.dataKey)}
          cue={COMPARISON_SERIES.find((s) => s.key === entry.dataKey)?.cue ?? SERIES_CUES[0]!}
          color={entry.color ?? ""}
          label={entry.name ?? ""}
          value={(entry.value as number).toFixed(1)}
        />
      ))}
    </ChartTooltipFrame>
  )
}

// connectNulls ON so a sparse series (circumferences logged every few weeks) reads as one line.
export function MeasurementComparisonChart({ data }: { data: MeasurementComparison }) {
  const { t } = useTranslation()

  return (
    <ResponsiveContainer width="100%" height={280}>
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
            value: t("progress.body.comparison.baseline"),
            position: "insideTopRight",
            fill: "var(--subtle)",
            fontSize: 9,
            fontFamily: "var(--font-mono)",
          }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border-strong)" }} />
        {COMPARISON_SERIES.filter((s) => data.present[s.key]).map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={t(s.labelKey)}
            stroke={s.color}
            strokeWidth={lineWidth(s.cue)}
            strokeDasharray={s.cue.dash}
            connectNulls
            dot={markerDot(s.cue, s.color)}
            activeDot={{ r: 5, fill: "var(--background)", stroke: s.color, strokeWidth: 2.5 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
