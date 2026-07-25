import { describe, expect, it } from "vitest"

import { moveItem, nextOrder, reindex } from "./ordering"

describe("moveItem", () => {
  const items = ["a", "b", "c"]

  it("moves an item up and down", () => {
    expect(moveItem(items, 2, -1)).toEqual(["a", "c", "b"])
    expect(moveItem(items, 0, 1)).toEqual(["b", "a", "c"])
  })

  it("is a no-op past either end", () => {
    expect(moveItem(items, 0, -1)).toEqual(items)
    expect(moveItem(items, 2, 1)).toEqual(items)
    expect(moveItem(items, 5, -1)).toEqual(items)
  })

  it("never mutates the input", () => {
    moveItem(items, 0, 1)
    expect(items).toEqual(["a", "b", "c"])
  })
})

describe("reindex", () => {
  it("rewrites order to the array position", () => {
    const rows = [
      { id: "a", order: 4 },
      { id: "b", order: 4 },
      { id: "c", order: 9 },
    ]
    expect(reindex(rows).map((r) => r.order)).toEqual([0, 1, 2])
  })
})

describe("nextOrder", () => {
  it("returns one past the highest order, 0 when empty", () => {
    expect(nextOrder([])).toBe(0)
    expect(nextOrder([{ order: 0 }, { order: 3 }])).toBe(4)
  })
})
