import { useContext } from "react"
import { SelectedDayContext } from "./dayContext"

// The selected day shared by the Dashboard and the Log tab. Throws outside
// `SelectedDayProvider` so a missing mount fails loudly instead of silently
// returning `undefined`.
export function useSelectedDay() {
  const value = useContext(SelectedDayContext)
  if (value === null) {
    throw new Error("useSelectedDay must be used within a SelectedDayProvider")
  }
  return value
}
