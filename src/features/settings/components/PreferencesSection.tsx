import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { updateSettings } from "@/data/settings"
import { WeightUnit } from "@/data/schema"
import { cn } from "@/lib/utils"

import { useSettings } from "../hooks/useSettings"
import { SettingsSection } from "./SettingsSection"

const THRESHOLD_STEP = 50
const THRESHOLD_MIN = 0
const THRESHOLD_MAX = 10000

// Default unit for NEW catalog exercises. Stored weights keep the unit they were
// logged with — this app never converts numbers behind the user's back.
export function UnitsSection() {
  const { t } = useTranslation()
  const { defaultWeightUnit } = useSettings()

  return (
    <SettingsSection title={t("settings.units.title")} body={t("settings.units.body")}>
      <div className="flex gap-1.5">
        {WeightUnit.options.map((unit) => {
          const active = unit === defaultWeightUnit
          return (
            <button
              key={unit}
              type="button"
              aria-pressed={active}
              onClick={() => updateSettings({ defaultWeightUnit: unit })}
              className={cn(
                "min-h-(--tap) min-w-0 flex-1 rounded-md border px-3 font-mono text-body transition-colors",
                active
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
              )}
            >
              {unit}
            </button>
          )
        })}
      </div>
    </SettingsSection>
  )
}

// The kcal floor below which a tracked day reads as "likely incomplete". Stored
// now; the Phase 2 calorie work is what consumes it.
export function CaloriesSection() {
  const { t } = useTranslation()
  const { calorieIncompleteThreshold } = useSettings()
  const [draft, setDraft] = useState(String(calorieIncompleteThreshold))

  function commit(raw: string) {
    const parsed = Number(raw)
    const value = Number.isFinite(parsed)
      ? Math.min(THRESHOLD_MAX, Math.max(THRESHOLD_MIN, Math.round(parsed)))
      : calorieIncompleteThreshold
    updateSettings({ calorieIncompleteThreshold: value })
    setDraft(String(value))
  }

  function step(delta: number) {
    commit(String((Number(draft) || calorieIncompleteThreshold) + delta))
  }

  return (
    <SettingsSection
      title={t("settings.calories.title")}
      body={t("settings.calories.body")}
      badge={
        <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-surface-2 px-2.5 py-1 font-mono text-micro font-semibold tracking-normal text-subtle">
          {t("common.phase2")}
        </span>
      }
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={t("settings.calories.less", { step: THRESHOLD_STEP })}
          disabled={calorieIncompleteThreshold <= THRESHOLD_MIN}
          onClick={() => step(-THRESHOLD_STEP)}
          className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-muted-foreground transition-colors hover:text-foreground active:translate-y-px disabled:text-disabled"
        >
          <Minus className="size-5" />
        </button>
        <label className="flex h-12 min-w-0 flex-1 items-center gap-1 rounded-md border border-border bg-surface-2 px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <input
            className="min-w-0 flex-1 bg-transparent text-right font-mono text-body-lg tabular-nums outline-none"
            inputMode="numeric"
            aria-label={t("settings.calories.label")}
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 5))}
            onBlur={(e) => commit(e.target.value)}
          />
          <span className="font-mono text-caption text-muted-foreground">
            {t("settings.calories.unit")}
          </span>
        </label>
        <button
          type="button"
          aria-label={t("settings.calories.more", { step: THRESHOLD_STEP })}
          disabled={calorieIncompleteThreshold >= THRESHOLD_MAX}
          onClick={() => step(THRESHOLD_STEP)}
          className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-muted-foreground transition-colors hover:text-foreground active:translate-y-px disabled:text-disabled"
        >
          <Plus className="size-5" />
        </button>
      </div>
      <p className="mt-2 text-caption text-subtle">{t("settings.calories.hint")}</p>
    </SettingsSection>
  )
}
