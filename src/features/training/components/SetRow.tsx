import { useRef, useState } from "react"
import { Check, Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

const STEP = 2.5

// Sanitise raw keystrokes to a decimal string: digits, one separator, comma→dot.
function sanitize(raw: string): string {
  return raw.replace(/[^0-9.,]/g, "").replace(",", ".")
}

function step(value: string, last: number | undefined, delta: number): string {
  const base = parseFloat(value || (last != null ? String(last) : "")) || 0
  return String(Math.max(0, Math.round((base + delta) * 100) / 100))
}

export interface SetRowProps {
  index: number
  /** Previous session's weight for this set, shown as a placeholder. */
  last: number | undefined
  value: string
  unit: string
  onChange: (value: string) => void
}

// Custom gym-optimised weight input (not shadcn): big tap targets, last-weight
// placeholder, fast decimal entry, ±2.5 steppers. Tokens only.
export function SetRow({ index, last, value, unit, onChange }: SetRowProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const filled = value !== ""

  return (
    <div className="flex items-stretch gap-2">
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-md font-mono text-body font-medium",
          filled
            ? "bg-success-soft text-success"
            : "bg-surface-2 text-muted-foreground",
        )}
        aria-hidden="true"
      >
        {filled ? <Check className="size-5" /> : index}
      </div>

      <label
        className={cn(
          "flex h-12 min-w-0 flex-1 cursor-text items-center gap-1 rounded-md border bg-surface-2 px-3 transition-colors",
          focused
            ? "border-ring ring-3 ring-ring/50"
            : filled
              ? "border-border-strong"
              : "border-border",
        )}
      >
        <input
          ref={inputRef}
          className="min-w-0 flex-1 bg-transparent text-right font-mono text-body-lg tabular-nums outline-none placeholder:text-subtle"
          inputMode="decimal"
          enterKeyHint="next"
          aria-label={`Satz ${index}`}
          placeholder={last != null ? String(last) : "—"}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(sanitize(e.target.value))}
        />
        <span className="font-mono text-caption text-muted-foreground">{unit}</span>
      </label>

      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          aria-label="2,5 weniger"
          className="flex size-12 items-center justify-center rounded-md border border-border bg-surface-2 text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
          onClick={() => onChange(step(value, last, -STEP))}
        >
          <Minus className="size-5" />
        </button>
        <button
          type="button"
          aria-label="2,5 mehr"
          className="flex size-12 items-center justify-center rounded-md border border-border bg-surface-2 text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
          onClick={() => onChange(step(value, last, STEP))}
        >
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  )
}
