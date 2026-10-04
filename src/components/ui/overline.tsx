import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

// Mono uppercase eyebrow label. Quiet grey by default (the prototype's
// `.overline`); the 0.16em tracking comes from the `text-micro` token.
// `tone="primary"` is the prototype's one deliberate blue overline (Dashboard preview).
export function Overline({
  className,
  tone = "subtle",
  ...props
}: ComponentProps<"div"> & { tone?: "subtle" | "primary" }) {
  return (
    <div
      className={cn(
        "font-mono text-micro uppercase",
        tone === "primary" ? "text-primary" : "text-subtle",
        className,
      )}
      {...props}
    />
  )
}
