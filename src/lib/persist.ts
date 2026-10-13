let attempted = false

export async function ensurePersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return false
  if (await navigator.storage.persisted()) return true
  if (attempted) return false
  attempted = true
  return navigator.storage.persist()
}
