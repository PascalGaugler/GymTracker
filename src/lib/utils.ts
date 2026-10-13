import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Without this, tailwind-merge misreads custom text-display / shadow-elev-1 as colour utilities and drops classes.
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
      shadow: ["elev-1", "elev-2", "elev-3", "inset-hi", "card"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
