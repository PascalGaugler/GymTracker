import { describe, expect, it } from "vitest"

import { swipeDirection } from "./useDaySwipe"

describe("swipeDirection", () => {
  it("reports right for a rightward swipe past the threshold", () => {
    expect(swipeDirection(80, 0)).toBe("right")
  })

  it("reports left for a leftward swipe past the threshold", () => {
    expect(swipeDirection(-80, 0)).toBe("left")
  })

  it("ignores a swipe shorter than the threshold", () => {
    expect(swipeDirection(40, 0)).toBeNull()
  })

  it("ignores a mostly-vertical gesture (a scroll, not a swipe)", () => {
    expect(swipeDirection(70, 50)).toBeNull()
  })

  it("is exactly the dx >= 2*dy boundary — equal is still a scroll", () => {
    expect(swipeDirection(70, 35)).toBeNull()
  })

  it("allows a diagonal gesture that is still clearly more horizontal", () => {
    expect(swipeDirection(70, 20)).toBe("right")
  })
})
