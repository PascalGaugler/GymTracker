// Vitest runs in Node, which has no localStorage. Settings persistence needs one,
// so tests install this minimal in-memory implementation on globalThis.
export function installMemoryStorage(): Storage {
  const map = new Map<string, string>()

  const storage: Storage = {
    get length() {
      return map.size
    },
    key: (index) => [...map.keys()][index] ?? null,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, String(value))
    },
    removeItem: (key) => {
      map.delete(key)
    },
    clear: () => {
      map.clear()
    },
  }

  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  })
  return storage
}
