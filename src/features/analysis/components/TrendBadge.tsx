import type { ReactNode } from "react"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

import type { TrendDir } from "../stats"

// Colour keys on whether the direction is DESIRABLE (`good`), not the arrow: a falling waist and a rising strength index are both green.
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
        "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-micro font-semibold tracking-normal",
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
