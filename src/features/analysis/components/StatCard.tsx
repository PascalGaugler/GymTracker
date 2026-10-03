import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// At-a-glance dashboard stat: an uppercase label + optional trend/soon badge,
// a big mono value with a small unit, and an optional muted sub-line. Custom
// surface (not shadcn chrome) built on the shadcn Card container with our
// tokens. `muted` renders the ghost/"coming soon" look (disabled value colour).
export function StatCard({
  label,
  value,
  unit,
  badge,
  sub,
  muted = false,
}: {
  label: string
  /** Formatted value, or null to show the no-data em-dash. */
  value: string | null
  unit?: string
  badge?: ReactNode
  sub?: string
  muted?: boolean
}) {
  const hasValue = value != null

  return (
    <Card size="sm" className="min-w-0 gap-0 p-3.5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
        <span className="max-w-full min-w-0 text-micro font-semibold tracking-wider text-muted-foreground uppercase hyphens-auto wrap-break-word">
          {label}
        </span>
        {badge}
      </div>

      <div
        className={cn(
          "flex flex-wrap items-baseline gap-x-1 font-mono text-h1 font-semibold tabular-nums",
          (!hasValue || muted) && "text-disabled",
        )}
      >
        {value ?? "—"}
        {hasValue && unit && <small className="text-body font-medium text-subtle">{unit}</small>}
      </div>

      {sub && <div className="mt-2 text-caption text-subtle">{sub}</div>}
    </Card>
  )
}
