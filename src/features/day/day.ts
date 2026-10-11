import { format, isSameDay, set, startOfDay } from "date-fns"

// "yyyy-MM-dd" — stable key for a calendar day (training-day lookups, React keys).
export function dayKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

// No day in this app is ever in the future: a selected/stamped day is always
// today or earlier. `now` is injectable for tests.
export function clampToToday(date: Date, now: Date = new Date()): Date {
  const today = startOfDay(now)
  const target = startOfDay(date)
  return target > today ? today : target
}

// Stamps a (possibly past) day with a timestamp: `now` itself when `day` is
// today, otherwise `day`'s calendar date combined with `now`'s time of day —
// so a backfilled entry sorts after same-day entries created earlier.
export function stampOnDay(day: Date, now: Date = new Date()): Date {
  if (isSameDay(day, now)) return now
  return set(day, {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    milliseconds: now.getMilliseconds(),
  })
}
