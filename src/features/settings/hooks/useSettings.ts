import { useSyncExternalStore } from "react"

import { getSettings, subscribeSettings, type Settings } from "@/data/settings"

export function useSettings(): Settings {
  return useSyncExternalStore(subscribeSettings, getSettings)
}
