// Pure list-order helpers shared by the plan (workouts) and workout (slots)
// editors. Both persist an explicit `order` field, so every move is followed by
// a reindex to 0..n-1 — gaps or duplicates would break the [planId+order] index
// ordering and the rotation.

/** Moves the item at `index` by `delta` places. Out-of-range moves are no-ops. */
export function moveItem<T>(items: readonly T[], index: number, delta: number): T[] {
  const target = index + delta
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) {
    return [...items]
  }
  const next = [...items]
  const [moved] = next.splice(index, 1)
  next.splice(target, 0, moved)
  return next
}

/** Rewrites `order` to the array position, so it always reads 0..n-1. */
export function reindex<T extends { order: number }>(items: readonly T[]): T[] {
  return items.map((item, order) => ({ ...item, order }))
}

/** The `order` a newly appended item gets (one past the current maximum). */
export function nextOrder(items: readonly { order: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.order + 1), 0)
}
