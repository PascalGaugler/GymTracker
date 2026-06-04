import { useRef, useState } from "react"
import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

// Sanitise raw keystrokes to a decimal string: digits, one separator, comma→dot.
function sanitize(raw: string): string {
  return raw.replace(/[^0-9.,]/g, "").replace(",", ".")
}

function step(value: string, last: number | undefined, delta: number): string {
  const base = parseFloat(value || (last != null ? String(last) : "")) || 0
  return String(Math.max(0, Math.round((base + delta) * 100) / 100))
}

export interface MeasurementInputProps {
  label: string
  unit: string
  /** Stepper increment (e.g. 0.1 kg for bodyweight, 0.5 cm for circumferences). */
  stepBy: number
  /** Latest stored value for this type, shown as the placeholder. */
  last: number | undefined
  value: string
  onChange: (value: string) => void
}

// Custom gym-optimised numeric input (not shadcn), same pattern as the logging
// SetRow: big tap targets, last-value placeholder, fast decimal entry, ± stepper.
// Tokens only. Stacks label over the input row so it fits at 320px.
export function MeasurementInput({
  label,
  unit,
  stepBy,
  last,
  value,
  onChange,
}: MeasurementInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const filled = value !== ""

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-caption font-medium text-muted-foreground">{label}</span>
      <div className="flex items-stretch gap-2">
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
            aria-label={label}
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
            aria-label={`${label} −${stepBy}`}
            className="flex size-12 items-center justify-center rounded-md border border-border bg-surface-2 text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
            onClick={() => onChange(step(value, last, -stepBy))}
          >
            <Minus className="size-5" />
          </button>
          <button
            type="button"
            aria-label={`${label} +${stepBy}`}
            className="flex size-12 items-center justify-center rounded-md border border-border bg-surface-2 text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
            onClick={() => onChange(step(value, last, stepBy))}
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
