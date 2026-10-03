import type { ParseKeys } from "i18next"

import type { TrendDir } from "./stats"

// Rule-based insight copy for the chart "Insight" boxes (docs/charts.md). The
// wording is picked from FIXED-baseline numbers only (never free text, never a
// rolling baseline); this module returns i18n KEYS and the caller interpolates.

/** Index change below this (in index points) counts as "flat". */
export const INSIGHT_EPSILON = 0.5

type InsightKey = ParseKeys

export interface InsightBadge {
  dir: TrendDir
  good: boolean
  labelKey: InsightKey
}

export interface InsightResult {
  /** Optional pill shown before the text; null = text only. */
  badge: InsightBadge | null
  textKey: InsightKey
  /** True when the text interpolates `{{strength}}` and `{{weight}}`. */
  usesDeltas: boolean
}

type TextName =
  | "noBaseline"
  | "noBodyweight"
  | "thesis"
  | "holding"
  | "strengthLost"
  | "strengthUp"
  | "weightUp"
  | "strengthDown"
  | "noTrend"
type BadgeName = "strengthUp" | "strengthHolds" | "strengthDown" | "weightUp"

function result(
  textKey: TextName,
  badge: InsightBadge | null = null,
  usesDeltas = true,
): InsightResult {
  return { badge, textKey: `progress.recomposition.insight.${textKey}`, usesDeltas }
}

function badge(dir: TrendDir, good: boolean, labelKey: BadgeName): InsightBadge {
  return { dir, good, labelKey: `progress.recomposition.insight.badge.${labelKey}` }
}

function dirOf(delta: number): TrendDir {
  if (delta > INSIGHT_EPSILON) return "up"
  if (delta < -INSIGHT_EPSILON) return "down"
  return "flat"
}

/**
 * Pick the recomposition takeaway from the strength-index and bodyweight-index
 * change since the fixed baseline (index points; both are 100 at baseline).
 * `null` = no baseline / no data yet for that series.
 */
export function recompositionInsight(
  strengthDelta: number | null,
  bodyweightDelta: number | null,
): InsightResult {
  if (strengthDelta == null) return result("noBaseline", null, false)
  if (bodyweightDelta == null) return result("noBodyweight", null, false)

  const strength = dirOf(strengthDelta)
  const weight = dirOf(bodyweightDelta)

  if (weight === "down") {
    if (strength === "up") return result("thesis", badge("up", true, "strengthUp"))
    if (strength === "flat") return result("holding", badge("flat", true, "strengthHolds"))
    return result("strengthLost", badge("down", false, "strengthDown"))
  }
  if (strength === "up") return result("strengthUp")
  if (weight === "up") return result("weightUp", badge("up", false, "weightUp"))
  if (strength === "down") return result("strengthDown", badge("down", false, "strengthDown"))
  return result("noTrend")
}
