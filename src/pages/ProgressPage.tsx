import { useTranslation } from "react-i18next"

import { PageHeader } from "./PageHeader"
import { Placeholder } from "./Placeholder"

export function ProgressPage() {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader overline={t("nav.progress")} title={t("progress.title")} />
      <Placeholder>{t("progress.placeholder")}</Placeholder>
    </>
  )
}
