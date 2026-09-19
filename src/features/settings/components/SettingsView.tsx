import { useTranslation } from "react-i18next"

import { PageHeader } from "@/pages/PageHeader"

import { useSettings } from "../hooks/useSettings"
import { BackupSection } from "./BackupSection"
import { CaloriesSection, UnitsSection } from "./PreferencesSection"
import { SettingsSection } from "./SettingsSection"

// Settings: the backup surface plus the handful of preferences the app has.
// Yazio stays a disabled placeholder until the Phase 2 integration exists.
export function SettingsView() {
  const { t } = useTranslation()
  const { calorieIncompleteThreshold } = useSettings()

  return (
    <>
      <PageHeader overline={t("nav.settings")} title={t("settings.title")} />

      <div className="flex flex-col gap-4">
        <BackupSection />
        <UnitsSection />
        {/* Keyed by the stored value so its input reseeds when a backup import
            replaces preferences from outside this screen. */}
        <CaloriesSection key={calorieIncompleteThreshold} />
        <SettingsSection
          title={t("settings.yazio.title")}
          body={t("settings.yazio.body")}
          muted
          badge={
            <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-surface-2 px-2.5 py-1 font-mono text-micro font-semibold tracking-normal text-subtle">
              {t("common.phase2")}
            </span>
          }
        />
      </div>
    </>
  )
}
