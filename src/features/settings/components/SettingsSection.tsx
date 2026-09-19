import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

// One settings block: title, explanation, then its controls. Tokens only.
export function SettingsSection({
  title,
  body,
  badge,
  muted = false,
  children,
}: {
  title: string
  body: string
  badge?: ReactNode
  muted?: boolean
  children?: ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-surface p-4 shadow-elev-1",
        muted && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 text-h3 font-semibold">{title}</h2>
        {badge}
      </div>
      <p className="mt-1 text-body text-muted-foreground">{body}</p>
      {children && <div className="mt-4">{children}</div>}
    </section>
  )
}
