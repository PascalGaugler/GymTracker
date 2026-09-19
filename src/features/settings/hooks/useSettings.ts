import { useSyncExternalStore } from "react"

import { getSettings, subscribeSettings, type Settings } from "@/data/settings"

// Live preferences. The store lives in src/data (localStorage), so this hook is
// to settings what the useLiveQuery hooks are to repositories: the read seam.
export function useSettings(): Settings {
  return useSyncExternalStore(subscribeSettings, getSettings)
}
