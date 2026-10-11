import type { ReactNode } from "react"

import { Overline } from "@/components/ui/overline"

// Per-screen heading: a mono overline above a display title (matches the
// design reference's scr-head treatment). Built with design tokens only.
// `action` is an optional right-aligned slot (e.g. the Dashboard's day-nav
// controls) — the title column shrinks (`min-w-0 flex-1`) so it truncates
// instead of pushing the action off-screen at 320px.
export function PageHeader({
  overline,
  title,
  action,
}: {
  overline?: string
  title: string
  action?: ReactNode
}) {
  return (
    <header className="mb-6 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        {overline && <Overline>{overline}</Overline>}
        <h1 className="truncate text-h1 font-bold">{title}</h1>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  )
}
