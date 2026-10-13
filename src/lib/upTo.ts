import { endOfDay } from "date-fns"

// Inclusive end-of-day boundary, so the day itself is never cut off.
export function upTo<T>(items: T[], getDate: (item: T) => Date, until: Date): T[] {
  const boundary = endOfDay(until).getTime()
  return items.filter((item) => getDate(item).getTime() <= boundary)
}
