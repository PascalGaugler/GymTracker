import { describe, expect, it } from "vitest"
import { clampToToday, dayKey, stampOnDay } from "./day"

describe("dayKey", () => {
  it("formats as yyyy-MM-dd regardless of time of day", () => {
    expect(dayKey(new Date("2026-05-08T23:59:59.999"))).toBe("2026-05-08")
    expect(dayKey(new Date("2026-05-08T00:00:00.000"))).toBe("2026-05-08")
  })
})

describe("clampToToday", () => {
  const now = new Date("2026-05-08T14:30:00")

  it("keeps a past day, normalised to its start of day", () => {
    const past = new Date("2026-05-01T09:00:00")
    expect(clampToToday(past, now)).toEqual(new Date("2026-05-01T00:00:00"))
  })

  it("keeps today, normalised to start of day", () => {
    expect(clampToToday(now, now)).toEqual(new Date("2026-05-08T00:00:00"))
  })

  it("clamps a future day down to today", () => {
    const future = new Date("2026-05-09T09:00:00")
    expect(clampToToday(future, now)).toEqual(new Date("2026-05-08T00:00:00"))
  })
})

describe("stampOnDay", () => {
  const now = new Date("2026-05-08T14:30:45.123")

  it("returns `now` itself when `day` is today", () => {
    const today = new Date("2026-05-08T00:00:00")
    expect(stampOnDay(today, now)).toEqual(now)
  })

  it("combines a past day's date with `now`'s time of day", () => {
    const past = new Date("2026-05-01T00:00:00")
    expect(stampOnDay(past, now)).toEqual(new Date("2026-05-01T14:30:45.123"))
  })
})
