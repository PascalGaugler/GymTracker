import { useTranslation } from "react-i18next"

export function Placeholder({ children }: { children: string }) {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border border-dashed border-border bg-surface/40 p-6 text-center">
      <p className="text-body text-muted-foreground">{children}</p>
      <p className="mt-2 font-mono text-micro text-subtle uppercase">{t("common.comingSoon")}</p>
    </div>
  )
}
