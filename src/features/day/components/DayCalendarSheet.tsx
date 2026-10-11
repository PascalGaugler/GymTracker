import { useEffect, useMemo, useRef } from "react"
import { startOfDay, startOfMonth } from "date-fns"
import { de } from "date-fns/locale"
import { Check } from "lucide-react"
import type { DayButtonProps } from "react-day-picker"
import { useTranslation } from "react-i18next"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { dayKey } from "../day"
import { useTrainingDays } from "../hooks/useTrainingDays"
import { useSelectedDay } from "../useSelectedDay"

const EMPTY_TRAINING_DAYS = new Set<string>()

// Dashboard day picker: a bottom sheet (same shell as the measurement
// quick-add) wrapping a shadcn Calendar. The inner content is keyed by the
// selected day so it remounts — and the month view resets to that day's month
// — every time the sheet reopens; Radix keeps sheet content mounted across
// opens, so without the key a stale month/selection would stick around.
export function DayCalendarSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { day } = useSelectedDay()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[90dvh] max-w-screen-sm">
        <DayCalendarSheetContent key={dayKey(day)} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  )
}

function DayCalendarSheetContent({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation()
  const { day, setDay, goToToday } = useSelectedDay()
  const trainingDays = useTrainingDays()
  const today = useMemo(() => startOfDay(new Date()), [])

  // Stable component identity across re-renders of the training-days query —
  // DayPicker remounts every day button when `components.DayButton` changes.
  const components = useMemo(
    () => ({
      DayButton: (props: DayButtonProps) => (
        <TrainingDayButton {...props} trainingDays={trainingDays ?? EMPTY_TRAINING_DAYS} />
      ),
    }),
    [trainingDays],
  )

  return (
    <>
      <SheetHeader>
        <SheetTitle>{t("day.calendarTitle")}</SheetTitle>
      </SheetHeader>

      <div className="mx-auto w-full max-w-sm min-w-0 px-4">
        <Calendar
          mode="single"
          locale={de}
          weekStartsOn={1}
          disabled={{ after: today }}
          endMonth={startOfMonth(today)}
          defaultMonth={day}
          selected={day}
          onSelect={(picked) => {
            if (!picked) return
            setDay(picked)
            onOpenChange(false)
          }}
          components={components}
          className="w-full bg-transparent p-0"
          classNames={{
            root: "w-full",
            day: "group/day relative flex h-(--tap) w-full min-w-0 items-center justify-center rounded-(--cell-radius) p-0 text-center select-none",
          }}
        />
      </div>

      <SheetFooter>
        <Button
          variant="outline"
          className="h-12 w-full"
          onClick={() => {
            goToToday()
            onOpenChange(false)
          }}
        >
          {t("day.today")}
        </Button>
      </SheetFooter>
    </>
  )
}

// Day-cell content: the day number plus a marker below it — a small neutral
// dot for any selectable past/today day, a green check for one with a logged
// session. Outside/disabled/hidden days get no marker.
function TrainingDayButton({
  day,
  modifiers,
  className,
  children,
  trainingDays,
  "aria-label": ariaLabel,
  ...props
}: DayButtonProps & { trainingDays: Set<string> }) {
  const { t } = useTranslation()
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const showMarker = !modifiers.outside && !modifiers.disabled && !modifiers.hidden
  const isTrainingDay = showMarker && trainingDays.has(dayKey(day.date))

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isTrainingDay ? `${ariaLabel} — ${t("day.trainingDay")}` : ariaLabel}
      data-selected-single={modifiers.selected || undefined}
      data-today={modifiers.today || undefined}
      className={cn(
        "group flex h-(--tap) w-full min-w-0 flex-col items-center justify-center gap-0.5 border-0 font-normal leading-none not-data-[selected-single=true]:data-[today=true]:font-semibold not-data-[selected-single=true]:data-[today=true]:text-primary data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {showMarker &&
        (isTrainingDay ? (
          <span
            aria-hidden="true"
            className="flex size-3.5 items-center justify-center rounded-full bg-success text-success-foreground"
          >
            <Check className="size-2.5" />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-border-strong group-data-[selected-single=true]:bg-primary-foreground/60"
          />
        ))}
    </Button>
  )
}
