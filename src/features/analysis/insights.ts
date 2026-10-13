import type { ParseKeys } from "i18next"

import type { TrendDir } from "./stats"

// Wording is picked from FIXED-baseline numbers only; returns i18n KEYS, the caller interpolates.

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

function dirOf(delta: number, epsilon = INSIGHT_EPSILON): TrendDir {
  if (delta > epsilon) return "up"
  if (delta < -epsilon) return "down"
  return "flat"
}

/** Change since the fixed baseline in index points (100 at baseline); null = no baseline/data for that series. */
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

/** Bodyweight change below this (kg) counts as "flat" for the badge. */
export const BODYWEIGHT_EPSILON = 0.1
/** Circumference change below this (cm) counts as "flat". */
export const CIRCUMFERENCE_EPSILON = 0.5

export interface ValueBadge {
  dir: TrendDir
  good: boolean
  value: number
}

/** Down is desirable in a cut. null = fewer than two weigh-ins. */
export function bodyweightInsight(changeSinceStart: number | null): ValueBadge | null {
  if (changeSinceStart == null) return null
  return {
    dir: dirOf(changeSinceStart, BODYWEIGHT_EPSILON),
    good: changeSinceStart <= 0,
    value: changeSinceStart,
  }
}

type BodyTextName =
  | "noWaist"
  | "waistUp"
  | "waistFlat"
  | "waistDown"
  | "waistDownMuscleUp"
  | "waistDownMuscleHolds"
  | "waistDownMuscleDown"

export interface BodyComparisonInsight {
  /** Pill reporting the waist change; null when there is no waist change yet. */
  badge: ValueBadge | null
  textKey: InsightKey
}

function bodyResult(textName: BodyTextName, badge: ValueBadge | null): BodyComparisonInsight {
  return { badge, textKey: `progress.body.insight.${textName}` }
}

/** Raw cm change since each series' first value. Waist should fall; chest/biceps hold or rise. null = series missing or < 2 points. */
export function bodyComparisonInsight(changes: {
  waist: number | null
  chest: number | null
  biceps: number | null
}): BodyComparisonInsight {
  const { waist } = changes
  if (waist == null) return bodyResult("noWaist", null)

  const dir = dirOf(waist, CIRCUMFERENCE_EPSILON)
  const badge: ValueBadge = { dir, good: dir !== "up", value: waist }

  if (dir === "up") return bodyResult("waistUp", badge)
  if (dir === "flat") return bodyResult("waistFlat", badge)

  const muscle = [changes.chest, changes.biceps]
    .filter((c): c is number => c != null)
    .map((c) => dirOf(c, CIRCUMFERENCE_EPSILON))
  if (muscle.length === 0) return bodyResult("waistDown", badge)
  if (muscle.includes("down")) return bodyResult("waistDownMuscleDown", badge)
  if (muscle.includes("up")) return bodyResult("waistDownMuscleUp", badge)
  return bodyResult("waistDownMuscleHolds", badge)
}
