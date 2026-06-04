import { useTranslation } from "react-i18next"

import { PageHeader } from "./PageHeader"
import { Placeholder } from "./Placeholder"

export function SettingsPage() {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader overline={t("nav.settings")} title={t("settings.title")} />
      <Placeholder>{t("settings.placeholder")}</Placeholder>
    </>
  )
}
