import { useState } from "react"
import { ChevronRight, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { planRepository } from "@/data/repositories"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/pages/EmptyState"

import { usePlanList } from "../hooks/usePlanList"
import { PlanEditorDialog } from "./PlanEditorDialog"

// Plan overview: exactly one plan is active (it drives the Log rotation); the
// rest sit here as an archive until re-activated. Editing and deleting live on
// the plan detail screen, so this list stays a safe place to browse.
export function PlanListView() {
  const { t } = useTranslation()
  const plans = usePlanList()
  const [creating, setCreating] = useState(false)

  async function activate(id: string) {
    try {
      await planRepository.setActive(id)
      toast.success(t("manage.plans.activated"))
    } catch {
      toast.error(t("manage.plans.saveError"))
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="min-w-0 font-mono text-caption text-muted-foreground">
          {plans ? t("manage.plans.count", { count: plans.length }) : ""}
        </p>
        <Button
          className="size-11 shrink-0"
          size="icon"
          aria-label={t("manage.plans.add")}
          onClick={() => setCreating(true)}
        >
          <Plus className="size-5" />
        </Button>
      </div>

      {plans?.length === 0 && (
        <EmptyState
          title={t("manage.plans.empty.title")}
          body={t("manage.plans.empty.body")}
        >
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            {t("manage.plans.add")}
          </Button>
        </EmptyState>
      )}

      <ul className="flex flex-col gap-3">
        {plans?.map(({ plan, workoutCount, setCount }) => (
          <li
            key={plan.id}
            className={cn(
              "rounded-lg border bg-surface shadow-elev-1",
              plan.isActive ? "border-primary" : "border-border",
            )}
          >
            <Link
              to={`/manage/plans/${plan.id}`}
              className="flex min-h-(--tap) items-center gap-3 p-4 transition-colors hover:bg-surface-2"
            >
              <div className="min-w-0 flex-1">
                {plan.isActive && (
                  <div className="font-mono text-micro tracking-[0.16em] text-primary uppercase">
                    {t("manage.plans.active")}
                  </div>
                )}
                <div className="truncate text-h3 font-semibold">{plan.name}</div>
                <div className="mt-0.5 font-mono text-caption text-muted-foreground">
                  {t("manage.plans.summary", {
                    workouts: workoutCount,
                    sets: setCount,
                  })}
                </div>
              </div>
              <ChevronRight className="size-5 shrink-0 text-subtle" aria-hidden="true" />
            </Link>

            {!plan.isActive && (
              <div className="border-t border-border px-2 py-1">
                <button
                  type="button"
                  onClick={() => void activate(plan.id)}
                  className="min-h-(--tap) w-full rounded-md px-2 text-caption font-medium text-primary transition-colors hover:bg-primary-soft"
                >
                  {t("manage.plans.activate")}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <PlanEditorDialog
        plan={null}
        open={creating}
        onOpenChange={setCreating}
        activateOnCreate={plans?.length === 0}
      />
    </>
  )
}
