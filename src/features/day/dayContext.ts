import { createContext } from "react"

export interface SelectedDayContextValue {
  /** The selected day, start-of-day. Never in the future. */
  day: Date
  isToday: boolean
  setDay(date: Date): void
  /** Moves the selected day by `delta` days (negative = earlier), clamped to today. */
  shiftDay(delta: number): void
  goToToday(): void
}

// Split from SelectedDayContext.tsx: react-refresh/only-export-components only
// allows a component file to export components, and this context object is
// shared by both the provider component and the useSelectedDay hook.
export const SelectedDayContext = createContext<SelectedDayContextValue | null>(null)
