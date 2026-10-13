import { createContext } from "react"

export interface SelectedDayContextValue {
  /** Start-of-day; never in the future. */
  day: Date
  isToday: boolean
  setDay(date: Date): void
  /** Negative = earlier; clamped to today. */
  shiftDay(delta: number): void
  goToToday(): void
}

// Separate file: react-refresh/only-export-components forbids non-component exports in SelectedDayContext.tsx.
export const SelectedDayContext = createContext<SelectedDayContextValue | null>(null)
