import { describe, expect, it } from "vitest"

import { formatDecimal, formatSigned } from "./format"

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

describe("formatSigned", () => {
  it("prefixes + for positive values", () => {
    expect(formatSigned(54.94, 1)).toBe("+54.9")
  })

  it("uses a true minus glyph for negative values", () => {
    expect(formatSigned(-6.5, 1)).toBe("−6.5")
    expect(formatSigned(-1.234, 2)).toBe("−1.23")
  })

  it("shows no sign for zero", () => {
    expect(formatSigned(0, 1)).toBe("0.0")
    expect(formatSigned(-0, 1)).toBe("0.0")
  })

  it("decides the sign after rounding, so tiny values carry none", () => {
    expect(formatSigned(-0.04, 1)).toBe("0.0")
    expect(formatSigned(0.04, 1)).toBe("0.0")
    // toFixed rounds 0.05 up (binary 0.05 is slightly above), so the sign appears.
    expect(formatSigned(-0.05, 1)).toBe("−0.1")
    expect(formatSigned(0.05, 1)).toBe("+0.1")
  })
})
