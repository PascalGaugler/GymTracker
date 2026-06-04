import { db } from "../data/db"

// Clears every store so each test starts from an empty database.
export async function resetDb(): Promise<void> {
  await Promise.all(db.tables.map((table) => table.clear()))
}
