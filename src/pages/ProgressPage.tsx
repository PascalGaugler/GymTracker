import { useTranslation } from "react-i18next"
import { NavLink, Outlet, useLocation } from "react-router-dom"

import {
  SegmentedScroller,
  segmentedItemVariants,
  segmentedListVariants,
} from "@/components/ui/segmented"

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
    <SegmentedScroller className="mb-5">
      <div className={segmentedListVariants()}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => segmentedItemVariants({ active: isActive })}
          >
            {t(tab.key)}
          </NavLink>
        ))}
      </div>
    </SegmentedScroller>
  )
}

const VIEW_SEGMENTS = ["recomposition", "strength", "exercise", "body"] as const

// The title names the active sub-view; the overline stays "Fortschritt".
function useViewTitle(): string {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const seg = pathname.split("/")[2]
  const view = VIEW_SEGMENTS.find((v) => v === seg)
  return view ? t(`progress.tabs.${view}`) : t("progress.title")
}

export function ProgressPage() {
  const { t } = useTranslation()
  const title = useViewTitle()

  return (
    <>
      <PageHeader overline={t("nav.progress")} title={title} />
      <ProgressNav />
      <Outlet />
    </>
  )
}

export function ProgressComingSoon() {
  const { t } = useTranslation()
  return <Placeholder>{t("progress.placeholder")}</Placeholder>
}
