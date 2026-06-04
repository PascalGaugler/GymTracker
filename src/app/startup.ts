import { seedIfEmpty } from "@/data/seed"
import { ensurePersistentStorage } from "@/lib/persist"

// One-time app bootstrap, run before the first data read. Requests durable
// storage (the seed below is our first write) and seeds the PPL template on a
// fresh database. Both are idempotent and degrade silently.
export async function runStartup(): Promise<void> {
  await ensurePersistentStorage()
  await seedIfEmpty()
}
