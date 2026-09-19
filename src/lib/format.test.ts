import { describe, expect, it } from "vitest"

import { formatDecimal } from "./format"

describe("formatDecimal", () => {
  it("strips float drift carried by stored values", () => {
    expect(formatDecimal(88.10000000000001, 1)).toBe("88.1")
    expect(formatDecimal(38.900000000000006, 1)).toBe("38.9")
    expect(formatDecimal(0.1 + 0.2, 1)).toBe("0.3")
  })

  it("rounds circumferences to a single decimal", () => {
    expect(formatDecimal(88.16, 1)).toBe("88.2")
    expect(formatDecimal(104.74, 1)).toBe("104.7")
  })

  it("keeps two decimals for scale and machine readings", () => {
    expect(formatDecimal(80.45, 2)).toBe("80.45")
    expect(formatDecimal(62.55, 2)).toBe("62.55")
    expect(formatDecimal(88.10000000000001, 2)).toBe("88.1")
  })

  it("drops trailing zeros rather than padding whole numbers", () => {
    expect(formatDecimal(80, 2)).toBe("80")
    expect(formatDecimal(82.5, 2)).toBe("82.5")
    expect(formatDecimal(100, 1)).toBe("100")
  })
})
