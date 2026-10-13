import { format } from "date-fns"
import { de } from "date-fns/locale"

export function formatDayLong(date: Date): string {
  return format(date, "EEEE · d. MMMM", { locale: de })
}

export function formatDayShort(date: Date): string {
  return format(date, "EEE, d. MMM", { locale: de })
}

// Drops trailing zeros; stored values can carry float drift (88.10000000000001), so format on read.
export function formatDecimal(value: number, decimals: number): string {
  return String(Number(value.toFixed(decimals)))
}

// Sign follows the ROUNDED value (-0.04 at 1 decimal is "0.0", never "−0.0").
export function formatSigned(value: number, decimals: number): string {
  const magnitude = Math.abs(value).toFixed(decimals)
  if (Number(magnitude) === 0) return magnitude
  return `${value > 0 ? "+" : "−"}${magnitude}`
}
