import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Registers our custom type-scale and shadow-scale utilities (defined in
// src/index.css's @theme block) so tailwind-merge treats them as members of
// those scales instead of misreading e.g. `text-display` as a text *colour*
// or `shadow-elev-1` as a shadow *colour* utility. Without this, cn() drops
// legitimate classes whenever a custom size/shadow name collides by prefix
// with an unrelated Tailwind core group (see src/lib/utils.test.ts).
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display-xl",
        "display",
        "h1",
        "h2",
        "h3",
        "body-lg",
        "body",
        "label",
        "caption",
        "micro",
      ],
      shadow: ["elev-1", "elev-2", "elev-3", "inset-hi"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
