import { format } from "date-fns"
import { de } from "date-fns/locale"

// Dashboard/Log overline date label: "Montag · 8. Mai", `de` locale.
export function formatDayLong(date: Date): string {
  return format(date, "EEEE · d. MMMM", { locale: de })
}

// Rounds to `decimals` places and drops trailing zeros: 88.10000000000001 → "88.1",
// 62.55 → "62.55", 80 → "80". Stored values can carry float drift from older
// records, so anything read back from the DB is formatted before it reaches the UI.
// Trimming keeps a whole 80 kg reading as "80" instead of padding it to "80.00".
export function formatDecimal(value: number, decimals: number): string {
  return String(Number(value.toFixed(decimals)))
}

// Explicit-sign number with a true minus glyph: 1.4 → "+1.4", -1.4 → "−1.4", 0 → "0.0".
// The sign follows the ROUNDED value, so -0.04 at 1 decimal is "0.0", never "−0.0".
// Dot decimal, matching the rest of the app's numbers. Unit-less; callers append it.
export function formatSigned(value: number, decimals: number): string {
  const magnitude = Math.abs(value).toFixed(decimals)
  if (Number(magnitude) === 0) return magnitude
  return `${value > 0 ? "+" : "−"}${magnitude}`
}
