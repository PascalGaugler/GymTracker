import { seedIfEmpty } from "@/data/seed"
import { ensurePersistentStorage } from "@/lib/persist"

let inFlight: Promise<void> | undefined

// Idempotent; calls share one in-flight run so a StrictMode double effect doesn't start it twice.
export function runStartup(): Promise<void> {
  inFlight ??= (async () => {
    await ensurePersistentStorage()
    await seedIfEmpty()
  })()
  return inFlight
}
