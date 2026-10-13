import { useRef, useState } from "react"
import { Check, Minus, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { formatDecimal } from "@/lib/format"
import { cn } from "@/lib/utils"

const STEP = 2.5

// Machine stacks and micro-plates can carry 2 decimals, so keep that precision.
const DECIMALS = 2

function sanitize(raw: string): string {
  return raw.replace(/[^0-9.,]/g, "").replace(",", ".")
}

function step(value: string, last: number | undefined, delta: number): string {
  const base = parseFloat(value || (last != null ? String(last) : "")) || 0
  return String(Math.max(0, Math.round((base + delta) * 100) / 100))
}

export interface SetRowProps {
  index: number
  last: number | undefined
  value: string
  unit: string
  onChange: (value: string) => void
}

export function SetRow({ index, last, value, unit, onChange }: SetRowProps) {
  const { t, i18n } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const filled = value !== ""
  const stepLabel = STEP.toLocaleString(i18n.language)

  return (
    <div className="flex items-center gap-1.5 @2xs:gap-2.5">
      <div
        className={cn(
          "flex size-7 shrink-0 @2xs:size-8.5 items-center justify-center rounded-full border font-mono text-caption",
          filled
            ? "border-success bg-success text-success-foreground"
            : "border-border-strong text-muted-foreground",
        )}
        aria-hidden="true"
      >
        {filled ? <Check className="size-4" /> : index}
      </div>

      <label
        className={cn(
          "flex h-14 min-w-0 flex-1 cursor-text items-center gap-1 rounded-md border bg-surface-2 px-1.5 transition-colors @2xs:gap-1.5 @2xs:px-3.5",
          focused
            ? "border-primary ring-3 ring-primary-soft"
            : filled
              ? "border-primary"
              : "border-border",
        )}
      >
        <input
          ref={inputRef}
          className="min-w-0 flex-1 bg-transparent text-right font-mono text-body-lg font-semibold tabular-nums outline-none placeholder:font-medium placeholder:text-subtle @2xs:text-h2"
          inputMode="decimal"
          enterKeyHint="next"
          aria-label={t("log.setLabel", { n: index })}
          placeholder={last != null ? formatDecimal(last, DECIMALS) : "—"}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(sanitize(e.target.value))}
        />
        <span className="font-mono text-caption text-subtle">{unit}</span>
      </label>

      <div className="flex shrink-0 gap-1 @2xs:gap-1.5">
        <button
          type="button"
          aria-label={t("log.stepDown", { step: stepLabel })}
          className="flex size-12 items-center justify-center rounded-sm border border-border-strong bg-surface text-foreground transition-colors active:translate-y-px active:bg-surface-2"
          onClick={() => onChange(step(value, last, -STEP))}
        >
          <Minus className="size-5" />
        </button>
        <button
          type="button"
          aria-label={t("log.stepUp", { step: stepLabel })}
          className="flex size-12 items-center justify-center rounded-sm border border-border-strong bg-surface text-foreground transition-colors active:translate-y-px active:bg-surface-2"
          onClick={() => onChange(step(value, last, STEP))}
        >
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  )
}
