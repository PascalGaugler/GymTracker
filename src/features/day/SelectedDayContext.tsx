import { useCallback, useMemo, useState, type ReactNode } from "react"
import { addDays, isSameDay, startOfDay } from "date-fns"

import { clampToToday } from "./day"
import { SelectedDayContext, type SelectedDayContextValue } from "./dayContext"

// The day selected on the Dashboard, shared with the Log tab (genuinely
// global — Context is warranted here per CLAUDE.md). Internal state is
// `Date | null`; `null` means "today", which is derived fresh from
// `new Date()` on every render (never cached), so leaving the app open past
// midnight rolls the selected day over correctly. `setDay`/`shiftDay` clamp
// to today — no future days — and collapse back to `null` when the result
// is today, so `isToday` stays correct after navigating back.
export function SelectedDayProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<Date | null>(null)

  const day = override ?? startOfDay(new Date())
  const isToday = override === null

  const setDay = useCallback((date: Date) => {
    const now = new Date()
    const clamped = clampToToday(date, now)
    setOverride(isSameDay(clamped, now) ? null : clamped)
  }, [])

  const shiftDay = useCallback((delta: number) => {
    setOverride((prev) => {
      const now = new Date()
      const current = prev ?? startOfDay(now)
      const shifted = clampToToday(addDays(current, delta), now)
      return isSameDay(shifted, now) ? null : shifted
    })
  }, [])

  const goToToday = useCallback(() => setOverride(null), [])

  const value = useMemo<SelectedDayContextValue>(
    () => ({ day, isToday, setDay, shiftDay, goToToday }),
    [day, isToday, setDay, shiftDay, goToToday],
  )

  return <SelectedDayContext.Provider value={value}>{children}</SelectedDayContext.Provider>
}
