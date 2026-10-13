import { useCallback, useMemo, useState, type ReactNode } from "react"
import { addDays, isSameDay, startOfDay } from "date-fns"

import { clampToToday } from "./day"
import { SelectedDayContext, type SelectedDayContextValue } from "./dayContext"

// `null` means today, derived fresh every render so the day rolls over past midnight.
// setDay/shiftDay clamp to today and collapse back to `null` when the result is today.
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
