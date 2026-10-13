import { format } from "date-fns"
import { de } from "date-fns/locale"

export const axisTick = {
  fill: "var(--subtle)",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
} as const

export function formatDate(t: number): string {
  return format(t, "d. MMM", { locale: de })
}
