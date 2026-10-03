import { seedIfEmpty } from "@/data/seed"
import { ensurePersistentStorage } from "@/lib/persist"

let inFlight: Promise<void> | undefined

// One-time app bootstrap, run before the first data read. Requests durable
// storage (the seed below is our first write) and seeds the PPL template on a
// fresh database. Both are idempotent and degrade silently. Calls share one
// in-flight run so a double-invoked effect (StrictMode) doesn't start it twice.
export function runStartup(): Promise<void> {
  inFlight ??= (async () => {
    await ensurePersistentStorage()
    await seedIfEmpty()
  })()
  return inFlight
}
