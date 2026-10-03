import type { ParseKeys } from "i18next"
import type { ReactElement } from "react"

import type { ComparisonType } from "../body"
import { MarkerShape } from "./ChartSwatches"

// Non-colour series cues (docs/design-system.md > Chart palette): every series pairs
// its hue with a dash pattern AND a marker glyph, indexed like `--chart-1 … 6`.
export type MarkerType = "circle" | "square" | "triangle" | "diamond" | "cross" | "star"

export interface SeriesCue {
  marker: MarkerType
  /** SVG stroke-dasharray; absent = solid. */
  dash?: string
  /** Thinner line (the sixth slot). */
  thin?: boolean
}

export const SERIES_CUES: readonly SeriesCue[] = [
  { marker: "circle" },
  { dash: "7 5", marker: "square" },
  { dash: "2 5", marker: "triangle" },
  { dash: "10 4 2 4", marker: "diamond" },
  { dash: "14 6", marker: "cross" },
  { thin: true, marker: "star" },
]

// Waist (fat proxy, should fall) vs. chest/biceps (muscle proxy, should hold).
// Distinct chart-palette colours; the labels reuse the measurement type strings.
export const COMPARISON_SERIES: {
  key: ComparisonType
  color: string
  labelKey: ParseKeys
  cue: SeriesCue
}[] = [
  {
    key: "waist",
    color: "var(--chart-4)",
    labelKey: "measurements.types.waist",
    cue: SERIES_CUES[3]!,
  },
  {
    key: "chest",
    color: "var(--chart-3)",
    labelKey: "measurements.types.chest",
    cue: SERIES_CUES[2]!,
  },
  {
    key: "biceps",
    color: "var(--chart-6)",
    labelKey: "measurements.types.biceps",
    cue: SERIES_CUES[5]!,
  },
]

/** Cue for the nth series, cycling through the six slots. */
export function cueAt(index: number): SeriesCue {
  return SERIES_CUES[index % SERIES_CUES.length] ?? { marker: "circle" }
}

export function lineWidth(cue: SeriesCue): number {
  return cue.thin ? 2 : 2.6
}

interface DotRenderProps {
  cx?: number
  cy?: number
  index?: number
}

// A Recharts `dot` render function drawing the series' marker at each point.
export function markerDot(cue: SeriesCue, color: string) {
  return function MarkerDot({ cx, cy, index }: DotRenderProps): ReactElement {
    if (cx == null || cy == null) return <g key={index} />
    return (
      <g key={index}>
        <MarkerShape marker={cue.marker} cx={cx} cy={cy} color={color} />
      </g>
    )
  }
}
