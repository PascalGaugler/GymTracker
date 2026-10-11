import { describe, expect, it } from "vitest"

import { upTo } from "./upTo"

interface Item {
  date: Date
}

describe("upTo", () => {
  const until = new Date("2026-05-08T09:00:00")

  it("includes items up to and including the end of the boundary day", () => {
    const items: Item[] = [
      { date: new Date("2026-05-08T00:00:00") },
      { date: new Date("2026-05-08T23:59:59.999") },
    ]
    expect(upTo(items, (i) => i.date, until)).toEqual(items)
  })

  it("excludes items dated the next day", () => {
    const items: Item[] = [
      { date: new Date("2026-05-08T23:59:59.999") },
      { date: new Date("2026-05-09T00:00:00") },
    ]
    expect(upTo(items, (i) => i.date, until)).toEqual([items[0]])
  })

  it("excludes items dated before the boundary day only when later than it", () => {
    const items: Item[] = [{ date: new Date("2026-05-01T00:00:00") }]
    expect(upTo(items, (i) => i.date, until)).toEqual(items)
  })

  it("returns an empty array for an empty input", () => {
    expect(upTo<Item>([], (i) => i.date, until)).toEqual([])
  })
})
