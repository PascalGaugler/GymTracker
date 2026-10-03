import { describe, expect, it } from "vitest"

import { INSIGHT_EPSILON, recompositionInsight } from "./insights"

const P = "progress.recomposition.insight"

describe("recompositionInsight", () => {
  it("asks for more data when there is no strength baseline yet", () => {
    const r = recompositionInsight(null, -3)
    expect(r.textKey).toBe(`${P}.noBaseline`)
    expect(r.badge).toBeNull()
    expect(r.usesDeltas).toBe(false)
  })

  it("asks for a weigh-in when only strength is known", () => {
    const r = recompositionInsight(4, null)
    expect(r.textKey).toBe(`${P}.noBodyweight`)
    expect(r.badge).toBeNull()
  })

  it("thesis case: weight down + strength up -> good badge", () => {
    const r = recompositionInsight(5, -3)
    expect(r.textKey).toBe(`${P}.thesis`)
    expect(r.badge).toEqual({ dir: "up", good: true, labelKey: `${P}.badge.strengthUp` })
    expect(r.usesDeltas).toBe(true)
  })

  it("weight down + strength flat -> good 'holds' badge", () => {
    const r = recompositionInsight(0.2, -2)
    expect(r.textKey).toBe(`${P}.holding`)
    expect(r.badge).toEqual({ dir: "flat", good: true, labelKey: `${P}.badge.strengthHolds` })
  })

  it("weight down + strength down -> bad badge", () => {
    const r = recompositionInsight(-4, -2)
    expect(r.textKey).toBe(`${P}.strengthLost`)
    expect(r.badge).toEqual({ dir: "down", good: false, labelKey: `${P}.badge.strengthDown` })
  })

  it("strength up with flat or rising weight -> text only", () => {
    for (const bw of [0, 0.3, 4]) {
      const r = recompositionInsight(6, bw)
      expect(r.textKey).toBe(`${P}.strengthUp`)
      expect(r.badge).toBeNull()
    }
  })

  it("weight up without a strength gain -> bad 'weight up' badge", () => {
    for (const s of [0, -5]) {
      const r = recompositionInsight(s, 3)
      expect(r.textKey).toBe(`${P}.weightUp`)
      expect(r.badge).toEqual({ dir: "up", good: false, labelKey: `${P}.badge.weightUp` })
    }
  })

  it("strength down with flat weight -> bad badge", () => {
    const r = recompositionInsight(-4, 0)
    expect(r.textKey).toBe(`${P}.strengthDown`)
    expect(r.badge?.good).toBe(false)
  })

  it("both flat -> no clear trend", () => {
    const r = recompositionInsight(0, 0.4)
    expect(r.textKey).toBe(`${P}.noTrend`)
    expect(r.badge).toBeNull()
  })

  it("treats exactly epsilon as flat", () => {
    expect(recompositionInsight(INSIGHT_EPSILON, -INSIGHT_EPSILON).textKey).toBe(`${P}.noTrend`)
  })
})
