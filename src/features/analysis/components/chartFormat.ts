import { format } from "date-fns"
import { de } from "date-fns/locale"

// Shared chart formatting: axis tick style + the "d. MMM" date label used by
// every analysis chart (axis ticks and tooltip headers).
export const axisTick = {
  fill: "var(--subtle)",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
} as const

export function formatDate(t: number): string {
  return format(t, "d. MMM", { locale: de })
}
