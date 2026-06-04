import { useLiveQuery } from "dexie-react-hooks"
import { useTranslation } from "react-i18next"

import { planRepository } from "@/data/repositories"

import { EmptyState } from "./EmptyState"
import { PageHeader } from "./PageHeader"
import { Placeholder } from "./Placeholder"

export function ManagePage() {
  const { t } = useTranslation()
  const plans = useLiveQuery(() => planRepository.getAll(), [])

  return (
    <>
      <PageHeader overline={t("nav.manage")} title={t("manage.title")} />
      {plans?.length === 0 ? (
        <EmptyState title={t("manage.empty.title")} body={t("manage.empty.body")} />
      ) : (
        <Placeholder>{t("manage.placeholder")}</Placeholder>
      )}
    </>
  )
}
