import type { ReactNode } from "react"
import { useState } from "react"
import type { ParseKeys } from "i18next"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { measurementRepository } from "@/data/repositories"
import type { MeasurementType, MeasurementUnit } from "@/data/schema"

import { useLatestMeasurements } from "../hooks/useLatestMeasurements"
import { MeasurementInput } from "./MeasurementInput"

interface Field {
  type: MeasurementType
  unit: MeasurementUnit
  stepBy: number
  labelKey: ParseKeys
}

// Bodyweight in kg (fine 0.1 steps); circumferences in cm (0.5 steps).
const FIELDS: Field[] = [
  { type: "bodyweight", unit: "kg", stepBy: 0.1, labelKey: "measurements.types.bodyweight" },
  { type: "waist", unit: "cm", stepBy: 0.5, labelKey: "measurements.types.waist" },
  { type: "chest", unit: "cm", stepBy: 0.5, labelKey: "measurements.types.chest" },
  { type: "biceps", unit: "cm", stepBy: 0.5, labelKey: "measurements.types.biceps" },
]

const EMPTY: Record<MeasurementType, string> = {
  bodyweight: "",
  waist: "",
  chest: "",
  biceps: "",
}

// One-tap quick-add: a bottom sheet (shadcn) launched from Dashboard/Progress-Body.
// `children` is the trigger. The form lives in its own component so it remounts
// with blank fields each time the sheet opens.
export function MeasurementQuickAdd({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[90dvh] max-w-screen-sm rounded-t-2xl"
      >
        <MeasurementForm onSaved={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

function isPositive(raw: string): number | null {
  const n = parseFloat(raw)
  return raw !== "" && !Number.isNaN(n) && n > 0 ? n : null
}

function MeasurementForm({ onSaved }: { onSaved: () => void }) {
  const { t } = useTranslation()
  const latest = useLatestMeasurements()
  const [values, setValues] = useState<Record<MeasurementType, string>>(EMPTY)
  const [saving, setSaving] = useState(false)

  const hasEntry = FIELDS.some(({ type }) => isPositive(values[type]) != null)

  async function handleSave() {
    setSaving(true)
    try {
      const measuredAt = new Date()
      const writes = FIELDS.flatMap(({ type, unit }) => {
        const value = isPositive(values[type])
        return value == null
          ? []
          : [measurementRepository.add({ type, value, unit, measuredAt, source: "manual" })]
      })
      await Promise.all(writes)
      toast.success(t("measurements.saved"))
      onSaved()
    } catch {
      toast.error(t("measurements.saveError"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{t("measurements.title")}</SheetTitle>
        <SheetDescription>{t("measurements.description")}</SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-4 overflow-y-auto px-4">
        {FIELDS.map(({ type, unit, stepBy, labelKey }) => (
          <MeasurementInput
            key={type}
            label={t(labelKey)}
            unit={unit}
            stepBy={stepBy}
            last={latest?.get(type)?.value}
            value={values[type]}
            onChange={(v) => setValues((prev) => ({ ...prev, [type]: v }))}
          />
        ))}
      </div>

      <SheetFooter>
        <Button
          className="h-12 w-full text-body-lg"
          disabled={saving || !hasEntry}
          onClick={handleSave}
        >
          {t("measurements.save")}
        </Button>
      </SheetFooter>
    </>
  )
}
