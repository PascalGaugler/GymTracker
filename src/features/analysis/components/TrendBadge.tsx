import type { ReactNode } from "react"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

import type { TrendDir } from "../stats"

// Trend pill: arrow + delta text. Colour is keyed on whether the direction is
// DESIRABLE (`good`), not on the literal arrow — a falling waist and a rising
// strength index are both green. Matches the design-reference `.badge`.
export function TrendBadge({
  dir,
  good,
  children,
}: {
  dir: TrendDir
  good: boolean
  children: ReactNode
}) {
  const Icon = dir === "up" ? ArrowUp : dir === "down" ? ArrowDown : Minus
  const tone = dir === "flat" ? "flat" : good ? "good" : "bad"

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-mono text-micro font-semibold tracking-normal",
        tone === "good" && "bg-success-soft text-success",
        tone === "bad" && "bg-danger-soft text-danger",
        tone === "flat" && "border border-border bg-surface-2 text-muted-foreground",
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {children}
    </span>
  )
}
