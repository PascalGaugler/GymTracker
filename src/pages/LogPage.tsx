import { useTranslation } from "react-i18next"

import { PageHeader } from "./PageHeader"
import { Placeholder } from "./Placeholder"

export function LogPage() {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader overline={t("nav.log")} title={t("log.title")} />
      <Placeholder>{t("log.placeholder")}</Placeholder>
    </>
  )
}
