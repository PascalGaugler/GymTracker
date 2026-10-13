import type { ReactNode } from "react"
import { useState } from "react"
import type { ParseKeys } from "i18next"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Overline } from "@/components/ui/overline"
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
import type { Measurement, MeasurementType, MeasurementUnit } from "@/data/schema"
import { dayKey, stampOnDay } from "@/features/day/day"
import { formatDayLong, formatDecimal } from "@/lib/format"

import { useLatestMeasurements } from "../hooks/useLatestMeasurements"
import { useMeasurementsOnDay } from "../hooks/useMeasurementsOnDay"
import { planMeasurementChanges } from "../planMeasurementChanges"
import { MeasurementInput } from "./MeasurementInput"

interface Field {
  type: MeasurementType
  unit: MeasurementUnit
  stepBy: number
  decimals: number
  labelKey: ParseKeys
}

// Scales report 2 decimals; tape measures are read to 1, a second decimal is noise.
const FIELDS: Field[] = [
  {
    type: "bodyweight",
    unit: "kg",
    stepBy: 0.1,
    decimals: 2,
    labelKey: "measurements.types.bodyweight",
  },
  { type: "waist", unit: "cm", stepBy: 0.5, decimals: 1, labelKey: "measurements.types.waist" },
  { type: "chest", unit: "cm", stepBy: 0.5, decimals: 1, labelKey: "measurements.types.chest" },
  { type: "biceps", unit: "cm", stepBy: 0.5, decimals: 1, labelKey: "measurements.types.biceps" },
]

const EMPTY: Record<MeasurementType, string> = {
  bodyweight: "",
  waist: "",
  chest: "",
  biceps: "",
}

const FIELD_BY_TYPE: Record<MeasurementType, Field> = Object.fromEntries(
  FIELDS.map((field) => [field.type, field]),
) as Record<MeasurementType, Field>

// `day` defaults to today; the Dashboard passes the selected day, Progress-Body omits it.
export function MeasurementQuickAdd({ children, day }: { children: ReactNode; day?: Date }) {
  const [open, setOpen] = useState(false)
  // Bumped on every open so the form remounts even if the day didn't change, dropping any stale draft.
  const [session, setSession] = useState(0)
  const resolvedDay = day ?? new Date()

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) setSession((n) => n + 1)
        setOpen(next)
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-h-[90dvh] max-w-screen-sm">
        <MeasurementFormLoader
          key={`${session}-${dayKey(resolvedDay)}`}
          day={resolvedDay}
          onSaved={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  )
}

function isPositive(raw: string): number | null {
  const n = parseFloat(raw)
  return raw !== "" && !Number.isNaN(n) && n > 0 ? n : null
}

// Shared by loading and loaded states so the sheet doesn't jump.
function QuickAddHeader({ day }: { day: Date }) {
  const { t } = useTranslation()
  const isToday = dayKey(day) === dayKey(new Date())
  return (
    <SheetHeader>
      {!isToday && <Overline>{formatDayLong(day)}</Overline>}
      <SheetTitle>{t("measurements.title")}</SheetTitle>
      <SheetDescription>{t("measurements.description")}</SheetDescription>
    </SheetHeader>
  )
}

// Hands off to the form only once both queries resolve, so form state isn't seeded from missing data.
function MeasurementFormLoader({ day, onSaved }: { day: Date; onSaved: () => void }) {
  const { t } = useTranslation()
  const prefill = useMeasurementsOnDay(day)
  const placeholders = useLatestMeasurements(day)

  if (prefill === undefined || placeholders === undefined) {
    return (
      <>
        <QuickAddHeader day={day} />
        <SheetFooter>
          <Button className="h-12 w-full text-body-lg" disabled>
            {t("measurements.save")}
          </Button>
        </SheetFooter>
      </>
    )
  }

  return (
    <MeasurementForm day={day} prefill={prefill} placeholders={placeholders} onSaved={onSaved} />
  )
}

function buildInitialValues(
  prefill: Map<MeasurementType, Measurement>,
): Record<MeasurementType, string> {
  const values = { ...EMPTY }
  for (const { type, decimals } of FIELDS) {
    const existing = prefill.get(type)
    if (existing) values[type] = formatDecimal(existing.value, decimals)
  }
  return values
}

function MeasurementForm({
  day,
  prefill,
  placeholders,
  onSaved,
}: {
  day: Date
  prefill: Map<MeasurementType, Measurement>
  placeholders: Map<MeasurementType, Measurement | undefined>
  onSaved: () => void
}) {
  const { t } = useTranslation()
  const [values, setValues] = useState<Record<MeasurementType, string>>(() =>
    buildInitialValues(prefill),
  )
  const [saving, setSaving] = useState(false)

  const parsedValues = Object.fromEntries(
    FIELDS.map(({ type }) => [type, isPositive(values[type])]),
  ) as Record<MeasurementType, number | null>
  const plan = planMeasurementChanges(prefill, parsedValues)
  const hasChanges = plan.add.length > 0 || plan.save.length > 0 || plan.remove.length > 0

  async function handleSave() {
    setSaving(true)
    try {
      const measuredAt = stampOnDay(day)
      await Promise.all([
        ...plan.add.map(({ type, value }) =>
          measurementRepository.add({
            type,
            value,
            unit: FIELD_BY_TYPE[type].unit,
            measuredAt,
            source: "manual",
          }),
        ),
        ...plan.save.map(({ existing, value }) =>
          measurementRepository.save({ ...existing, value }),
        ),
        ...plan.remove.map((id) => measurementRepository.remove(id)),
      ])
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
      <QuickAddHeader day={day} />

      <div className="flex flex-col gap-4 overflow-y-auto px-4">
        {FIELDS.map(({ type, unit, stepBy, decimals, labelKey }) => (
          <MeasurementInput
            key={type}
            label={t(labelKey)}
            unit={unit}
            stepBy={stepBy}
            decimals={decimals}
            last={placeholders.get(type)?.value}
            value={values[type]}
            onChange={(v) => setValues((prev) => ({ ...prev, [type]: v }))}
          />
        ))}
      </div>

      <SheetFooter>
        <Button
          className="h-12 w-full text-body-lg"
          disabled={saving || !hasChanges}
          onClick={handleSave}
        >
          {t("measurements.save")}
        </Button>
      </SheetFooter>
    </>
  )
}
