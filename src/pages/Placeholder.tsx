import { useTranslation } from "react-i18next"

// Neutral "this screen arrives in a later phase" body used by route scaffolding
// until the real feature lands. Pages own their headers; this is the body only.
export function Placeholder({ children }: { children: string }) {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border border-dashed border-border bg-surface/40 p-6 text-center">
      <p className="text-body text-muted-foreground">{children}</p>
      <p className="mt-2 font-mono text-micro tracking-[0.16em] text-subtle uppercase">
        {t("common.comingSoon")}
      </p>
    </div>
  )
}
