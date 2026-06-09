import { format } from "date-fns"
import { de } from "date-fns/locale"
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

const LINE = "var(--chart-1)" // top set — solid
const BAND = "var(--chart-1)" // min–max spread — faint fill

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
  payload?: { payload?: DrilldownPoint }[]
  unit?: string
}

// Date header + the top set and the session's min–max range. Reads the row off
// the payload so both the line and the band describe the same session.
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
          {t("progress.exercise.topSet")}
        </span>
        <span className="font-mono text-caption font-semibold tabular-nums">
          {row.top.toFixed(1)}
          <span className="ml-0.5 text-subtle">{suffix}</span>
        </span>
      </div>
      {row.min !== row.top && (
        <div className="flex items-center gap-3">
          <span className="flex-1 text-caption text-muted-foreground">
            {t("progress.exercise.range")}
          </span>
          <span className="font-mono text-caption tabular-nums text-subtle">
            {row.min.toFixed(1)}–{row.top.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  )
}

// Single-exercise drilldown: a top-set line over a faint min–max band (the
// session's set spread). One exercise, one raw-weight axis.
export function ExerciseDrilldownChart({
  data,
  unit,
}: {
  data: DrilldownData
  unit: string
}) {
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
          type="monotone"
          dataKey="band"
          stroke="none"
          fill={BAND}
          fillOpacity={0.14}
          isAnimationActive={false}
          activeDot={false}
        />
        <Line
          type="monotone"
          dataKey="top"
          stroke={LINE}
          strokeWidth={2.6}
          dot={{ r: 2.8, fill: LINE, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "var(--background)", stroke: LINE, strokeWidth: 2.5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
