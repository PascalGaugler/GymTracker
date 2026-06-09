import { format } from "date-fns"
import { de } from "date-fns/locale"
import type { ParseKeys } from "i18next"
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

import type { ComparisonType, MeasurementComparison } from "../body"

// Waist (fat proxy, should fall) vs. chest/biceps (muscle proxy, should hold).
// Distinct chart-palette colours; the labels reuse the measurement type strings.
const SERIES: { key: ComparisonType; color: string; labelKey: ParseKeys }[] = [
  { key: "waist", color: "var(--chart-5)", labelKey: "measurements.types.waist" },
  { key: "chest", color: "var(--chart-1)", labelKey: "measurements.types.chest" },
  { key: "biceps", color: "var(--chart-3)", labelKey: "measurements.types.biceps" },
]

const axisTick = {
  fill: "var(--subtle)",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
} as const

function formatDate(t: number): string {
  return format(t, "d. MMM", { locale: de })
}

interface ChartTooltipProps {
  active?: boolean
  label?: number | string
  payload?: { dataKey?: string | number; name?: string; value?: number | null; color?: string }[]
}

// Date header + a coloured row per series present that day, each showing its
// value indexed to 100 at the series' own start.
function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
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
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: entry.color }}
            aria-hidden="true"
          />
          <span className="flex-1 truncate text-caption text-muted-foreground">{entry.name}</span>
          <span className="font-mono text-caption font-semibold tabular-nums">
            {(entry.value as number).toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  )
}

// Circumference comparison: each present series indexed to 100 at its own start on
// ONE shared axis, with a baseline reference line at 100. connectNulls is ON so a
// sparse series (circumferences logged every few weeks) reads as one line.
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
        {SERIES.filter((s) => data.present[s.key]).map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={t(s.labelKey)}
            stroke={s.color}
            strokeWidth={2.6}
            connectNulls
            dot={{ r: 2.8, fill: s.color, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "var(--background)", stroke: s.color, strokeWidth: 2.5 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
