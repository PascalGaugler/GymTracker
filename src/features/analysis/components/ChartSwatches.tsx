import type { MarkerType, SeriesCue } from "./chartCues"

function starPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r * 1.35 : r * 0.55
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(" ")
}

export function MarkerShape({
  marker,
  cx,
  cy,
  color,
  r = 3,
}: {
  marker: MarkerType
  cx: number
  cy: number
  color: string
  r?: number
}) {
  switch (marker) {
    case "square":
      return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={color} />
    case "triangle":
      return (
        <polygon
          points={`${cx},${cy - r * 1.2} ${cx + r * 1.1},${cy + r} ${cx - r * 1.1},${cy + r}`}
          fill={color}
        />
      )
    case "diamond":
      return (
        <rect
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          fill={color}
          transform={`rotate(45 ${cx} ${cy})`}
        />
      )
    case "cross":
      return (
        <path
          d={`M${cx - r} ${cy - r} L${cx + r} ${cy + r} M${cx + r} ${cy - r} L${cx - r} ${cy + r}`}
          stroke={color}
          strokeWidth={2}
          fill="none"
        />
      )
    case "star":
      return <polygon points={starPoints(cx, cy, r)} fill={color} />
    default:
      return <circle cx={cx} cy={cy} r={r} fill={color} />
  }
}

export function LegendSwatch({
  cue,
  color,
  label,
}: {
  cue: SeriesCue
  color: string
  label: string
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <svg width="34" height="12" viewBox="0 0 34 12" className="shrink-0" aria-hidden="true">
        <line
          x1="1"
          y1="6"
          x2="33"
          y2="6"
          stroke={color}
          strokeWidth={cue.thin ? 2 : 2.6}
          strokeDasharray={cue.dash ?? "0"}
        />
        <MarkerShape marker={cue.marker} cx={17} cy={6} color={color} r={3.2} />
      </svg>
      <span className="truncate text-caption text-muted-foreground">{label}</span>
    </span>
  )
}

export function TooltipSwatch({ cue, color }: { cue: SeriesCue; color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0" aria-hidden="true">
      <MarkerShape marker={cue.marker} cx={5} cy={5} color={color} r={3.2} />
    </svg>
  )
}
