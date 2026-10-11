import type { ComponentProps, ReactNode } from "react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

// Shared surface. Interactive variants (button / link) add hover, pressed and
// focus-visible states; the whole card is the tap target.
const SURFACE =
  "flex min-w-0 flex-col rounded-lg border border-border bg-card p-3.5 text-left text-body text-card-foreground shadow-card"
const INTERACTIVE =
  "cursor-pointer outline-none transition-[border-color,transform] duration-(--dur-fast) ease-standard hover:border-border-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-99"

interface StatCardGoal {
  /** 0–1, already clamped. */
  progress: number
  /** Visible mono caption, left ("Start 90"). */
  startLabel: string
  /** Visible mono caption, right ("Ziel 80 kg"). */
  targetLabel: string
  /** Spoken form appended to the accessible name ("Ziel 80.0 kg, 62 %"). */
  spoken: string
}

interface StatCardProps {
  label: string
  /** Formatted value, or null to show the no-data em-dash. */
  value: string | null
  unit?: string
  badge?: ReactNode
  sub?: string
  /** Progress bar toward a target; replaces `sub` (prototype: goal ? bar : sub). */
  goal?: StatCardGoal
  muted?: boolean
  /** Renders the card as a link to this route. */
  to?: string
  /** Makes the card a button; the text is appended (visually hidden) to its accessible name. */
  actionHint?: string
}

// At-a-glance dashboard stat: an uppercase label + optional trend/soon badge,
// a big mono value with a small unit, and an optional muted sub-line. Custom
// surface (not shadcn chrome) with our tokens. `muted` renders the ghost/"coming
// soon" look (disabled value colour).
//
// Static by default. With `to` it is a link; when used as a trigger child (for
// example of MeasurementQuickAdd, which injects click/aria props) pass `actionHint`
// and it renders a button. The hint is a visually hidden suffix, so the accessible
// name stays "label value unit trend sub – action" instead of being replaced. The content is phrasing-only (spans) so it is valid
// inside both.
export function StatCard({
  label,
  value,
  unit,
  badge,
  sub,
  goal,
  muted = false,
  to,
  actionHint,
  ...triggerProps
}: StatCardProps & Omit<ComponentProps<"button">, "children" | "className" | "value">) {
  const hasValue = value != null

  const content = (
    <>
      <span className="mb-2.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
        <span className="max-w-full min-w-0 text-micro font-semibold tracking-wider text-muted-foreground uppercase hyphens-auto wrap-break-word">
          {label}
        </span>
        {badge && <span className="sr-only">, </span>}
        {badge}
      </span>

      {!badge && null}

      <span className="sr-only">, </span>
      <span
        className={cn(
          "flex flex-wrap items-baseline gap-x-1 font-mono text-h1 font-semibold tabular-nums",
          (!hasValue || muted) && "text-disabled",
        )}
      >
        {value ?? "—"}
        {hasValue && unit && (
          <>
            {" "}
            <small className="text-body font-medium text-subtle">{unit}</small>
          </>
        )}
      </span>

      {goal ? (
        <>
          <span className="sr-only">, {goal.spoken}</span>
          <span aria-hidden="true" className="mt-3 block">
            <span className="block h-1.5 overflow-hidden rounded-full bg-surface-2">
              <span
                className="block h-full rounded-full bg-linear-to-r from-accent to-primary transition-[width] duration-(--dur) ease-standard"
                style={{ width: `${Math.round(goal.progress * 100)}%` }}
              />
            </span>
            <span className="mt-1.5 flex flex-wrap justify-between gap-x-2 font-mono text-micro text-subtle">
              <span>{goal.startLabel}</span>
              <span className="text-primary">{goal.targetLabel}</span>
            </span>
          </span>
        </>
      ) : sub ? (
        <>
          <span className="sr-only">, </span>
          <span className="mt-2 block text-caption text-subtle">{sub}</span>
        </>
      ) : null}
      {actionHint && <span className="sr-only"> – {actionHint}</span>}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cn(SURFACE, INTERACTIVE)}>
        {content}
      </Link>
    )
  }

  if (actionHint) {
    return (
      <button type="button" {...triggerProps} className={cn(SURFACE, INTERACTIVE)}>
        {content}
      </button>
    )
  }

  return <div className={SURFACE}>{content}</div>
}
