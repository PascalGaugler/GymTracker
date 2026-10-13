// Every move is followed by a reindex to 0..n-1: gaps or duplicates would break the [planId+order] index and rotation.

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

export function reindex<T extends { order: number }>(items: readonly T[]): T[] {
  return items.map((item, order) => ({ ...item, order }))
}

export function nextOrder(items: readonly { order: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.order + 1), 0)
}
