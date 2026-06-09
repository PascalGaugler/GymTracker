import { format } from "date-fns"
import { de } from "date-fns/locale"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { ProgressionData, ProgressionSeries } from "../strengthProgression"

const axisTick = {
  fill: "var(--subtle)",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
} as const

function formatDate(t: number): string {
  return format(t, "d. MMM", { locale: de })
}

// Minimal optional shape of Recharts' injected tooltip props (kept loose so the
// element form type-checks across Recharts' tooltip generics, per Phase 5).
interface ChartTooltipProps {
  active?: boolean
  label?: number | string
  payload?: {
    dataKey?: string | number
    name?: string
    value?: number | null
    color?: string
  }[]
  /** exercise id → unit, so each row can show its own kg/lb. */
  units?: Record<string, string>
}

// Date header + a coloured row per exercise logged on that session. Each row
// reads its own series value, so a swap day shows only the exercise actually done.
function ChartTooltip({ active, payload, label, units }: ChartTooltipProps) {
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
          <span className="flex-1 truncate text-caption text-muted-foreground">
            {entry.name}
          </span>
          <span className="font-mono text-caption font-semibold tabular-nums">
            {(entry.value as number).toFixed(1)}
            <span className="ml-0.5 text-subtle">
              {units?.[String(entry.dataKey)] ?? ""}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

// Multi-line per-workout progression: one top-set line per (visible) exercise on
// a shared raw-weight axis. connectNulls is left OFF so a swapped exercise — a
// separate series with null on the other's dates — never bridges the gap.
export function StrengthProgressionChart({
  data,
  visible,
}: {
  data: ProgressionData
  visible: ProgressionSeries[]
}) {
  const units = Object.fromEntries(data.series.map((s) => [s.exerciseId, s.unit]))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data.rows} margin={{ top: 16, right: 14, bottom: 4, left: -12 }}>
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
          content={<ChartTooltip units={units} />}
          cursor={{ stroke: "var(--border-strong)" }}
        />
        {visible.map((s) => (
          <Line
            key={s.exerciseId}
            type="monotone"
            dataKey={s.exerciseId}
            name={s.name}
            stroke={s.color}
            strokeWidth={2.6}
            dot={{ r: 2.8, fill: s.color, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "var(--background)", stroke: s.color, strokeWidth: 2.5 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
