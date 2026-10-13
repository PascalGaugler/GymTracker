import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

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
