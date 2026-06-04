import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

import { SetRow } from "./SetRow"

export interface ExerciseLogCardProps {
  name: string
  unit: string
  targetSets: number
  repRange?: [number, number]
  /** Entered weight per set (index 0 = set 1), "" when blank. */
  values: string[]
  /** Last session's weight per set, for placeholders. */
  lasts: (number | undefined)[]
  onSetChange: (setIndex: number, value: string) => void
}

export function ExerciseLogCard({
  name,
  unit,
  targetSets,
  repRange,
  values,
  lasts,
  onSetChange,
}: ExerciseLogCardProps) {
  const { t } = useTranslation()
  const done = values.filter((v) => v !== "").length
  const complete = done === targetSets

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-elev-1">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-h3 font-semibold">{name}</div>
          <div className="mt-0.5 font-mono text-caption text-muted-foreground">
            {repRange
              ? t("log.setsRepRange", {
                  sets: targetSets,
                  low: repRange[0],
                  high: repRange[1],
                })
              : t("log.setsOnly", { sets: targetSets })}
          </div>
        </div>
        <div
          className={cn(
            "shrink-0 font-mono text-caption tabular-nums",
            complete ? "text-success" : "text-subtle",
          )}
        >
          {done}/{targetSets}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: targetSets }, (_, i) => (
          <SetRow
            key={i}
            index={i + 1}
            last={lasts[i]}
            value={values[i] ?? ""}
            unit={unit}
            onChange={(v) => onSetChange(i, v)}
          />
        ))}
      </div>
    </div>
  )
}
