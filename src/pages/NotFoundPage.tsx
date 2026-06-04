import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"

import { Button } from "@/components/ui/button"

import { PageHeader } from "./PageHeader"

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader overline="404" title="—" />
      <Button asChild variant="outline">
        <NavLink to="/">{t("nav.dashboard")}</NavLink>
      </Button>
    </>
  )
}
