import { useTranslation } from "react-i18next"
import { NavLink, Outlet } from "react-router-dom"

import { cn } from "@/lib/utils"

import { PageHeader } from "./PageHeader"
import { Placeholder } from "./Placeholder"

// Top-level Progress sub-views reachable from the segmented control. The
// single-exercise drilldown is param-based and drilled into from elsewhere
// (Phase 7), so it is not a segment here.
const TABS = [
  { to: "/progress/recomposition", key: "progress.tabs.recomposition" },
  { to: "/progress/strength", key: "progress.tabs.strength" },
  { to: "/progress/body", key: "progress.tabs.body" },
] as const

// Segmented control for the Progress hub. A horizontally scrollable strip so the
// full German labels stay readable at 320px (the strip — not the page — owns any
// overflow); on wider screens every segment is visible at once.
function ProgressNav() {
  const { t } = useTranslation()

  return (
    <nav className="-mx-4 mb-5 overflow-x-auto px-4 scrollbar-none [&::-webkit-scrollbar]:hidden">
      <div className="inline-flex gap-1 rounded-lg bg-surface-2 p-1">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "flex min-h-(--tap) items-center rounded-md px-4 text-caption font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-surface text-foreground shadow-elev-1"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            {t(tab.key)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

// Progress hub: shared header + segmented control above the active sub-view.
export function ProgressPage() {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader overline={t("nav.progress")} title={t("progress.title")} />
      <ProgressNav />
      <Outlet />
    </>
  )
}

// Body for Progress sub-views whose charts land in a later phase (P6-P8).
export function ProgressComingSoon() {
  const { t } = useTranslation()
  return <Placeholder>{t("progress.placeholder")}</Placeholder>
}
