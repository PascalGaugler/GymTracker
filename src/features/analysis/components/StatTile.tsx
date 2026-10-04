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
  // default = full foreground; muted = prototype's neutral delta; good = success
  tone?: "default" | "muted" | "good"
}) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-surface-2 px-1.5 py-2.5 @xs:px-2.5">
      <div
        className={cn(
          "flex flex-wrap items-baseline gap-x-0.5 font-mono text-body-lg font-semibold tabular-nums @max-[16rem]:text-body @xs:text-h2",
          tone === "good" && "text-success",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        <span className="whitespace-nowrap">{value}</span>
        {unit != null && <span className="text-caption font-normal text-subtle">{unit}</span>}
      </div>
      <div className="mt-1 min-w-0 text-micro tracking-normal text-subtle">{label}</div>
    </div>
  )
}
