import type { ReactNode } from "react"

// Plain-language takeaway under a chart: an optional trend pill + one line of
// text. Generic — the caller supplies the badge and (rule-based) copy.
export function Insight({ badge, children }: { badge?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md bg-surface-2 p-3 text-caption text-muted-foreground">
      {badge}
      <span className="min-w-0">{children}</span>
    </div>
  )
}
