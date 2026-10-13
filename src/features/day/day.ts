import { format, isSameDay, set, startOfDay } from "date-fns"

export function dayKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

// Days are never in the future. `now` is injectable for tests.
export function clampToToday(date: Date, now: Date = new Date()): Date {
  const today = startOfDay(now)
  const target = startOfDay(date)
  return target > today ? today : target
}

// Past days get `day`'s date with `now`'s time, so backfilled entries sort after earlier same-day ones.
export function stampOnDay(day: Date, now: Date = new Date()): Date {
  if (isSameDay(day, now)) return now
  return set(day, {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    milliseconds: now.getMilliseconds(),
  })
}
