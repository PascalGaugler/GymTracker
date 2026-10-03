import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

// A compact readout tile (value + unit over a label). Place inside an `@container`
// parent: the value steps up in size once the container is wide enough.
export function StatTile({
  value,
  unit,
  label,
  tone = "default",
}: {
  value: string
  unit?: string
  label: ReactNode
  tone?: "default" | "good"
}) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-surface-2 p-2.5">
      <div
        className={cn(
          "flex flex-wrap items-baseline gap-x-0.5 font-mono text-body-lg font-semibold tabular-nums @xs:text-h2",
          tone === "good" && "text-success",
        )}
      >
        <span>{value}</span>
        {unit != null && <span className="text-caption font-normal text-subtle">{unit}</span>}
      </div>
      <div className="mt-1 min-w-0 text-micro tracking-normal text-subtle">{label}</div>
    </div>
  )
}
