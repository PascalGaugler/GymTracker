import { format } from "date-fns"
import { de } from "date-fns/locale"
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

const RAW = "var(--subtle)" // faint individual weigh-ins
const TREND = "var(--recomp-bodyweight)" // violet 7-day average — the signal

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
  payload?: { payload?: BodyweightPoint }[]
  unit?: string
}

// Date header + the day's raw weigh-in and the 7-day average. Reads the whole row
// off the payload so both values describe the same day.
function ChartTooltip({ active, payload, unit }: ChartTooltipProps) {
  const { t } = useTranslation()
  if (!active || !payload || payload.length === 0) return null
  const row = payload[0]?.payload
  if (!row) return null

  const suffix = unit ? ` ${unit}` : ""
  return (
    <div className="rounded-md border border-border-strong bg-popover px-3 py-2 shadow-elev-2">
      <div className="mb-1 font-mono text-micro tracking-normal text-subtle">
        {formatDate(row.t)}
      </div>
      <div className="flex items-center gap-3">
        <span className="flex-1 text-caption text-muted-foreground">
          {t("progress.body.weight.raw")}
        </span>
        <span className="font-mono text-caption tabular-nums text-subtle">
          {row.raw.toFixed(1)}
          <span className="ml-0.5">{suffix}</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex-1 text-caption text-muted-foreground">
          {t("progress.body.weight.trend")}
        </span>
        <span className="font-mono text-caption font-semibold tabular-nums">
          {row.ma.toFixed(1)}
          <span className="ml-0.5 text-subtle">{suffix}</span>
        </span>
      </div>
    </div>
  )
}

// Bodyweight trend: faint raw weigh-ins (dots only) under a solid 7-day moving
// average — the smoothed line, not the noisy raw line, is the signal (docs/charts.md).
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
        {/* Raw weigh-ins: dots only (no connecting line), so noise reads as a scatter. */}
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
