import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const segmentedListVariants = cva("gap-1 rounded-md border border-border bg-surface-2 p-1", {
  variants: {
    layout: {
      inline: "inline-flex",
      wrap: "flex flex-wrap",
      fill: "grid auto-cols-fr grid-flow-col",
    },
  },
  defaultVariants: { layout: "inline" },
})

const segmentedItemVariants = cva(
  "flex min-h-(--tap) min-w-0 items-center justify-center rounded-sm px-4 text-caption font-semibold whitespace-nowrap transition-colors duration-(--dur-fast)",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground",
        false: "text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: { active: false },
  },
)

const pickChipVariants = cva(
  "flex min-h-(--tap) shrink-0 items-center rounded-full border px-4 text-caption font-semibold whitespace-nowrap transition-colors",
  {
    variants: {
      active: {
        true: "border-primary bg-primary text-primary-foreground",
        false: "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: { active: false },
  },
)

function SegmentedScroller({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      className={cn(
        "-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    />
  )
}

export { segmentedListVariants, segmentedItemVariants, pickChipVariants, SegmentedScroller }
