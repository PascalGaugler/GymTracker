import { ChevronDown, ChevronUp } from "lucide-react"

// Reorder control for an ordered list row (workouts, slots). Side-by-side rather
// than stacked so both halves keep a full --tap hit area and still fit at 320px.
export function ReorderRow({
  canMoveUp,
  canMoveDown,
  upLabel,
  downLabel,
  onMove,
}: {
  canMoveUp: boolean
  canMoveDown: boolean
  upLabel: string
  downLabel: string
  onMove: (delta: -1 | 1) => void
}) {
  return (
    <div className="flex border-t border-border">
      <button
        type="button"
        aria-label={upLabel}
        disabled={!canMoveUp}
        onClick={() => onMove(-1)}
        className="flex min-h-(--tap) flex-1 items-center justify-center rounded-bl-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:text-disabled disabled:hover:bg-transparent"
      >
        <ChevronUp className="size-5" />
      </button>
      <div className="w-px bg-border" aria-hidden="true" />
      <button
        type="button"
        aria-label={downLabel}
        disabled={!canMoveDown}
        onClick={() => onMove(1)}
        className="flex min-h-(--tap) flex-1 items-center justify-center rounded-br-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:text-disabled disabled:hover:bg-transparent"
      >
        <ChevronDown className="size-5" />
      </button>
    </div>
  )
}
