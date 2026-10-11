import { endOfDay } from "date-fns"

// Filters items to those dated on or before `until`'s calendar day (an
// inclusive end-of-day boundary, so the day itself is never cut off). The
// shared "as of the selected day" rule for dashboard stats, the strength
// index, and quick-add placeholders/prefill.
export function upTo<T>(items: T[], getDate: (item: T) => Date, until: Date): T[] {
  const boundary = endOfDay(until).getTime()
  return items.filter((item) => getDate(item).getTime() <= boundary)
}
