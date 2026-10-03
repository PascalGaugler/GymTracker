import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Non-interactive label pills (exercise chips, set tally, status, "soon").
// Interactive pick chips live in segmented.tsx.
const badgeVariants = cva(
  "inline-flex max-w-full shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 whitespace-nowrap",
  {
    variants: {
      variant: {
        tag: "inline-block truncate border-border bg-surface-2 text-caption text-muted-foreground",
        more: "border-border bg-surface-2 text-caption text-subtle",
        status:
          "border-primary bg-primary font-mono text-micro font-semibold tracking-widest text-primary-foreground uppercase",
        neutral:
          "border-border bg-surface-2 font-mono text-micro font-semibold tracking-normal text-muted-foreground",
        tally:
          "border-border bg-surface-2 font-mono text-caption font-semibold tabular-nums text-muted-foreground",
        tallyDone:
          "border-success bg-success-soft font-mono text-caption font-semibold tabular-nums text-success",
      },
    },
    defaultVariants: { variant: "tag" },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
