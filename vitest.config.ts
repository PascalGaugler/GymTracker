import path from "node:path"
import { defineConfig } from "vitest/config"

// Vitest runs the data layer in Node. Dexie needs an IndexedDB implementation,
// provided by fake-indexeddb in src/test/setup.ts.
export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
