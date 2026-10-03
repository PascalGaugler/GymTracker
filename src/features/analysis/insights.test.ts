import { describe, expect, it } from "vitest"

import {
  BODYWEIGHT_EPSILON,
  CIRCUMFERENCE_EPSILON,
  INSIGHT_EPSILON,
  bodyComparisonInsight,
  bodyweightInsight,
  recompositionInsight,
} from "./insights"

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

describe("bodyweightInsight", () => {
  it("has no badge without two weigh-ins", () => {
    expect(bodyweightInsight(null)).toBeNull()
  })

  it("losing weight -> good down badge", () => {
    expect(bodyweightInsight(-5.4)).toEqual({ dir: "down", good: true, value: -5.4 })
  })

  it("gaining weight -> bad up badge", () => {
    expect(bodyweightInsight(1.2)).toEqual({ dir: "up", good: false, value: 1.2 })
  })

  it("treats changes within epsilon as flat", () => {
    expect(bodyweightInsight(BODYWEIGHT_EPSILON)?.dir).toBe("flat")
    expect(bodyweightInsight(-BODYWEIGHT_EPSILON)?.dir).toBe("flat")
    expect(bodyweightInsight(0)?.dir).toBe("flat")
  })
})

describe("bodyComparisonInsight", () => {
  const B = "progress.body.insight"
  const none = { chest: null, biceps: null }

  it("asks for a waist measurement when there is no waist change", () => {
    const r = bodyComparisonInsight({ waist: null, chest: 1, biceps: 1 })
    expect(r.textKey).toBe(`${B}.noWaist`)
    expect(r.badge).toBeNull()
  })

  it("waist up -> bad badge", () => {
    const r = bodyComparisonInsight({ waist: 1.5, ...none })
    expect(r.textKey).toBe(`${B}.waistUp`)
    expect(r.badge).toEqual({ dir: "up", good: false, value: 1.5 })
  })

  it("waist flat -> flat badge", () => {
    const r = bodyComparisonInsight({ waist: 0.3, chest: -2, biceps: 2 })
    expect(r.textKey).toBe(`${B}.waistFlat`)
    expect(r.badge).toEqual({ dir: "flat", good: true, value: 0.3 })
  })

  it("waist down without muscle series -> plain waist-down text", () => {
    const r = bodyComparisonInsight({ waist: -6.2, ...none })
    expect(r.textKey).toBe(`${B}.waistDown`)
    expect(r.badge).toEqual({ dir: "down", good: true, value: -6.2 })
  })

  it("waist down, muscle holds", () => {
    const r = bodyComparisonInsight({ waist: -4, chest: 0.2, biceps: -0.4 })
    expect(r.textKey).toBe(`${B}.waistDownMuscleHolds`)
    expect(r.badge?.good).toBe(true)
  })

  it("waist down, muscle up", () => {
    expect(bodyComparisonInsight({ waist: -4, chest: 0, biceps: 1.5 }).textKey).toBe(
      `${B}.waistDownMuscleUp`,
    )
    expect(bodyComparisonInsight({ waist: -4, chest: 2, biceps: null }).textKey).toBe(
      `${B}.waistDownMuscleUp`,
    )
  })

  it("waist down, any muscle series down -> warns", () => {
    expect(bodyComparisonInsight({ waist: -4, chest: 2, biceps: -1.5 }).textKey).toBe(
      `${B}.waistDownMuscleDown`,
    )
  })

  it("treats exactly epsilon as flat", () => {
    const r = bodyComparisonInsight({ waist: -CIRCUMFERENCE_EPSILON, ...none })
    expect(r.textKey).toBe(`${B}.waistFlat`)
  })
})
