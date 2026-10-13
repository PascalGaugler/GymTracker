import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { TooltipSwatch } from "./ChartSwatches"
import type { SeriesCue } from "./chartCues"

// Shared chart tooltip building blocks. Each chart keeps its own thin tooltip
// (data mapping is chart-specific) and composes these for the common look.

/** Popover container + mono date/title header. */
export function ChartTooltipFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-border-strong bg-popover px-3 py-2 shadow-elev-2">
      <div className="mb-1 font-mono text-micro tracking-normal text-subtle">{title}</div>
      {children}
    </div>
  )
}

/**
 * One tooltip row: optional series swatch, truncating label, mono value + unit.
 * `sub` = secondary (muted, non-bold) row; `indent` aligns it under a swatch row.
 */
export function ChartTooltipRow({
  cue,
  color,
  label,
  value,
  unit,
  sub,
  indent,
}: {
  cue?: SeriesCue
  color?: string
  label: string
  value: string
  unit?: string
  sub?: boolean
  indent?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-2", indent && "pl-5")}>
      {cue && <TooltipSwatch cue={cue} color={color ?? ""} />}
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-caption",
          sub ? "text-subtle" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-caption tabular-nums",
          sub ? "text-muted-foreground" : "font-semibold",
        )}
      >
        {value}
        {unit && <span className="ml-0.5 text-subtle">{unit}</span>}
      </span>
    </div>
  )
}
