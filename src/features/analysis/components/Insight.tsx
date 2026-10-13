import type { ReactNode } from "react"

export function Insight({ badge, children }: { badge?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md bg-surface-2 p-3 text-caption text-muted-foreground">
      {badge}
      <span className="min-w-0">{children}</span>
    </div>
  )
}
