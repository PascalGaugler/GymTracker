import { format } from "date-fns"
import { de } from "date-fns/locale"
import { useLiveQuery } from "dexie-react-hooks"
import { Ruler } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { planRepository } from "@/data/repositories"
import { MeasurementQuickAdd } from "@/features/measurements/components/MeasurementQuickAdd"

import { EmptyState } from "./EmptyState"
import { PageHeader } from "./PageHeader"
import { Placeholder } from "./Placeholder"

export function DashboardPage() {
  const { t } = useTranslation()
  const plans = useLiveQuery(() => planRepository.getAll(), [])
  const today = format(new Date(), "EEEE · d. MMMM", { locale: de })

  return (
    <>
      <PageHeader overline={today} title={t("dashboard.title")} />
      <MeasurementQuickAdd>
        <Button variant="outline" className="mb-4 h-12 w-full text-body-lg">
          <Ruler aria-hidden="true" />
          {t("measurements.quickAdd")}
        </Button>
      </MeasurementQuickAdd>
      {plans?.length === 0 ? (
        <EmptyState
          title={t("dashboard.empty.title")}
          body={t("dashboard.empty.body")}
          steps={[
            t("dashboard.empty.steps.plan"),
            t("dashboard.empty.steps.exercises"),
            t("dashboard.empty.steps.session"),
          ]}
        />
      ) : (
        <Placeholder>{t("dashboard.placeholder")}</Placeholder>
      )}
    </>
  )
}
