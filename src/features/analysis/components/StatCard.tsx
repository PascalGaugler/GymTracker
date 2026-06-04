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
    <Card size="sm" className="min-w-0 gap-0 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 truncate text-caption font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        {badge}
      </div>

      <div
        className={cn(
          "mt-2 font-mono text-display font-semibold tabular-nums",
          (!hasValue || muted) && "text-disabled",
        )}
      >
        {value ?? "—"}
        {hasValue && unit && <small className="ml-1 text-body-lg text-subtle">{unit}</small>}
      </div>

      {sub && <div className="mt-1 truncate text-caption text-muted-foreground">{sub}</div>}
    </Card>
  )
}
