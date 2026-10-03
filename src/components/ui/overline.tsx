import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

// Mono uppercase eyebrow label. Quiet grey by default (the prototype's
// `.overline`); the 0.16em tracking comes from the `text-micro` token.
export function Overline({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("font-mono text-micro text-subtle uppercase", className)} {...props} />
}
