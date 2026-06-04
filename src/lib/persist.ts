// Asks the browser to treat our IndexedDB storage as durable (not evictable).
// Call on the first write. Installed PWAs are very likely granted persistence;
// where the API is unavailable we degrade silently.

let attempted = false

export async function ensurePersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return false
  if (await navigator.storage.persisted()) return true
  if (attempted) return false
  attempted = true
  return navigator.storage.persist()
}
