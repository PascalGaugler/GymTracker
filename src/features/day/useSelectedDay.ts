import { useContext } from "react"
import { SelectedDayContext } from "./dayContext"

export function useSelectedDay() {
  const value = useContext(SelectedDayContext)
  if (value === null) {
    throw new Error("useSelectedDay must be used within a SelectedDayProvider")
  }
  return value
}
